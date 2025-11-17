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
import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';
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
    private readonly embeddingQueue: EmbeddingQueue,
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
      await this.embeddingQueue.enqueueExperienceEmbedding({
        experienceId: updatedExperience.id,
        experienceType: input.experienceType,
        description,
      });
    }

    if (aisUnits.length > 0) {
      if (aisUnits.length === 1) {
        // Single AIS Unit - use single job
        const unit = aisUnits[0];
        await this.embeddingQueue.enqueueAisUnitEmbedding({
          aisUnitId: unit.id,
          action: unit.action,
          impact: unit.impact,
          context: unit.context,
          skills: unit.skills,
        });
      } else {
        // Multiple AIS Units - use batch job
        await this.embeddingQueue.enqueueAisUnitBatchEmbedding({
          units: aisUnits.map((unit) => ({
            aisUnitId: unit.id,
            action: unit.action,
            impact: unit.impact,
            context: unit.context,
            skills: unit.skills,
          })),
        });
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
