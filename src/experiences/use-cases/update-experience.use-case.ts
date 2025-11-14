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

    return {
      experience: mapExperienceToSummary(input.experienceType, updatedExperience),
      aisUnits: aisUnits.map(mapAisUnitToResponse),
    };
  }
}
