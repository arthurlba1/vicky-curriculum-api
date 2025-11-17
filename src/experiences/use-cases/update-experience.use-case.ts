import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { UpdateExperienceInput } from '@/experiences/dto/update-experience.input';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import {
  mapAisUnitToResponse,
  mapExperienceInputToEntityPayload,
  mapExperienceToSummary,
} from '@/experiences/mappers/experience.mapper';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';
import { ExperienceType } from '@/experiences/types/experience.types';
// import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';
import { EmbeddingsService } from '@/embeddings/embeddings.service';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';

export interface UpdateExperienceUseCaseInput extends UpdateExperienceInput {
  userId: string;
}

export interface UpdateExperienceUseCaseOutput {
  experience: ExperienceSummary;
  aisUnits: AisUnitResponse[];
}

@Injectable()
export class UpdateExperienceUseCase
  implements UseCase<UpdateExperienceUseCaseInput, UpdateExperienceUseCaseOutput>
{
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
    // private readonly embeddingQueue: EmbeddingQueue,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async execute(
    input: UpdateExperienceUseCaseInput,
  ): Promise<UpdateExperienceUseCaseOutput> {
    const repository = this.experienceRepositoryFactory.getRepository(
      input.experienceType,
    );

    const existingExperience = await repository.findByIdAndUserId(
      input.experienceId,
      input.userId,
    );

    if (!existingExperience) {
      throw new NotFoundException('Experience not found');
    }

    const payload = mapExperienceInputToEntityPayload(
      input.experienceType,
      input.experience,
    );

    const updatedExperience = await repository.updateExperience(
      input.experienceId,
      input.userId,
      payload as any,
    );

    await this.aisUnitsRepository.deleteByExperience(
      input.experienceId,
      input.experienceType,
    );

    const aisUnits = await Promise.all(
      (input.aisUnits ?? []).map((aisUnit) =>
        this.aisUnitsRepository.createUnit({
          ...aisUnit,
          experienceId: updatedExperience.id,
          experienceType: input.experienceType,
        }),
      ),
    );

    const description = this.extractDescription(input.experienceType, updatedExperience);
    if (description && description.trim().length > 0) {
      try {
        const { embedding, model } = await this.embeddingsService.generateEmbedding(description);
        const repository = this.experienceRepositoryFactory.getRepository(input.experienceType);
        await repository.update(updatedExperience.id, {
          embedding,
          embeddingModel: model,
        } as any);
      } catch (error) {
        console.error(`Failed to generate embedding for experience ${updatedExperience.id}:`, error);
      }
    }

    if (aisUnits.length > 0) {
      try {
        if (aisUnits.length === 1) {
          const unit = aisUnits[0];
          const unifiedText = this.embeddingsService.unifyAisUnitToText({
            action: unit.action,
            impact: unit.impact,
            context: unit.context,
            skills: unit.skills,
          });

          if (unifiedText && unifiedText.trim().length > 0) {
            const { embedding, model } = await this.embeddingsService.generateEmbedding(unifiedText);
            await this.aisUnitsRepository.update(unit.id, {
              embedding,
              embeddingModel: model,
            });
          }
        } else {
          const texts = aisUnits.map((unit) =>
            this.embeddingsService.unifyAisUnitToText({
              action: unit.action,
              impact: unit.impact,
              context: unit.context,
              skills: unit.skills,
            }),
          );

          const validTexts: string[] = [];
          const validUnits: typeof aisUnits = [];
          for (let i = 0; i < texts.length; i++) {
            if (texts[i] && texts[i].trim().length > 0) {
              validTexts.push(texts[i]);
              validUnits.push(aisUnits[i]);
            }
          }

          if (validTexts.length > 0) {
            const { embeddings, model } = await this.embeddingsService.generateEmbeddingsBatch(validTexts);
            await Promise.all(
              validUnits.map((unit, index) =>
                this.aisUnitsRepository.update(unit.id, {
                  embedding: embeddings[index],
                  embeddingModel: model,
                }),
              ),
            );
          }
        }
      } catch (error) {
        console.error(`Failed to generate embeddings for AIS units:`, error);
      }
    }

    return {
      experience: mapExperienceToSummary(input.experienceType, updatedExperience),
      aisUnits: aisUnits.map(mapAisUnitToResponse),
    };
  }

  private extractDescription(
    experienceType: ExperienceType,
    experience: ProfessionalExperience | ProjectExperience | AcademicExperience,
  ): string | undefined {
    switch (experienceType) {
      case ExperienceType.PROFESSIONAL:
        return (experience as ProfessionalExperience).generalDescription;
      case ExperienceType.PROJECT:
        return (experience as ProjectExperience).description;
      case ExperienceType.ACADEMIC:
        return (experience as AcademicExperience).description;
      default:
        return undefined;
    }
  }
}
