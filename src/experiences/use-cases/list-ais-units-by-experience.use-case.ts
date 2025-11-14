import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';
import {
  mapAisUnitToResponse,
  mapExperienceToSummary,
} from '@/experiences/mappers/experience.mapper';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';

export interface ListAisUnitsByExperienceInput {
  userId: string;
  experienceType: ExperienceType;
  experienceId: string;
}

export interface ListAisUnitsByExperienceOutput {
  experience: ExperienceSummary;
  aisUnits: AisUnitResponse[];
}

@Injectable()
export class ListAisUnitsByExperienceUseCase
  implements
    UseCase<ListAisUnitsByExperienceInput, ListAisUnitsByExperienceOutput>
{
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
  ) {}

  async execute(
    input: ListAisUnitsByExperienceInput,
  ): Promise<ListAisUnitsByExperienceOutput> {
    const repository = this.experienceRepositoryFactory.getRepository(
      input.experienceType,
    );

    const experience = await repository.findByIdAndUserId(
      input.experienceId,
      input.userId,
    );

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    const aisUnits = await this.aisUnitsRepository.findByExperience(
      input.experienceId,
      input.experienceType,
    );

    return {
      experience: mapExperienceToSummary(input.experienceType, experience),
      aisUnits: aisUnits.map(mapAisUnitToResponse),
    };
  }
}
