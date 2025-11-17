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
import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';

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
    private readonly embeddingQueue: EmbeddingQueue,
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
      await this.embeddingQueue.enqueueExperienceEmbedding({
        experienceId: experience.id,
        experienceType: input.experienceType,
        description,
      });
    }

    if (aisUnits.length > 0) {
      if (aisUnits.length === 1) {
        const unit = aisUnits[0];
        await this.embeddingQueue.enqueueAisUnitEmbedding({
          aisUnitId: unit.id,
          action: unit.action,
          impact: unit.impact,
          context: unit.context,
          skills: unit.skills,
        });
      } else {
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
