import { Injectable, BadRequestException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { CreateExperienceInput } from '@/experiences/dto/create-experience.input';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import {
  mapAisUnitToResponse,
  mapExperienceInputToEntityPayload,
  mapExperienceToSummary,
} from '@/experiences/mappers/experience.mapper';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { ExperienceType } from '@/experiences/types/experience.types';
// import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';
import { EmbeddingsService } from '@/embeddings/embeddings.service';

export interface CreateExperienceUseCaseInput extends CreateExperienceInput {
  userId: string;
}

export interface CreateExperienceUseCaseOutput {
  experience: ExperienceSummary;
  aisUnits: AisUnitResponse[];
}

@Injectable()
export class CreateExperienceUseCase
  implements UseCase<CreateExperienceUseCaseInput, CreateExperienceUseCaseOutput>
{
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
    // private readonly embeddingQueue: EmbeddingQueue,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async execute(
    input: CreateExperienceUseCaseInput,
  ): Promise<CreateExperienceUseCaseOutput> {
    if (!input.experience) {
      throw new BadRequestException('Experience data is required');
    }

    const repository = this.experienceRepositoryFactory.getRepository(
      input.experienceType,
    );

    const payload = mapExperienceInputToEntityPayload(
      input.experienceType,
      input.experience,
    );

    const experience = await repository.createExperience(payload as ProfessionalExperience | ProjectExperience | AcademicExperience, input.userId);

    const aisUnits = await Promise.all(
      (input.aisUnits ?? []).map((aisUnit) =>
        this.aisUnitsRepository.createUnit({
          ...aisUnit,
          experienceId: experience.id,
          experienceType: input.experienceType,
        }),
      ),
    );

    const description = this.extractDescription(input.experienceType, experience);
    if (description && description.trim().length > 0) {
      try {
        const { embedding, model } = await this.embeddingsService.generateEmbedding(description);
        const repository = this.experienceRepositoryFactory.getRepository(input.experienceType);
        await repository.update(experience.id, {
          embedding,
          embeddingModel: model,
        } as any);
      } catch (error) {
        console.error(`Failed to generate embedding for experience ${experience.id}:`, error);
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
      experience: mapExperienceToSummary(input.experienceType, experience),
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
