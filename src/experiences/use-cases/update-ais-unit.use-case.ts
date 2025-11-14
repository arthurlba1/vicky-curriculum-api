import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { UpdateAisUnitInput } from '@/experiences/dto/update-ais-unit.input';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { mapAisUnitToResponse } from '@/experiences/mappers/experience.mapper';

export interface UpdateAisUnitUseCaseInput {
  userId: string;
  experienceType: ExperienceType;
  experienceId: string;
  aisUnit: UpdateAisUnitInput;
}

@Injectable()
export class UpdateAisUnitUseCase
  implements UseCase<UpdateAisUnitUseCaseInput, AisUnitResponse>
{
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
  ) {}

  async execute(input: UpdateAisUnitUseCaseInput): Promise<AisUnitResponse> {
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

    const aisUnit = await this.aisUnitsRepository.findById(input.aisUnit.id);
    if (!aisUnit) {
      throw new NotFoundException('AIS Unit not found');
    }

    if (
      aisUnit.experienceId !== input.experienceId ||
      aisUnit.experienceType !== input.experienceType
    ) {
      throw new ForbiddenException('AIS Unit does not belong to this experience');
    }

    const updatedAisUnit = await this.aisUnitsRepository.updateUnit(aisUnit.id, {
      action: input.aisUnit.action,
      impact: input.aisUnit.impact,
      context: input.aisUnit.context,
      skills: input.aisUnit.skills,
    });

    return mapAisUnitToResponse(updatedAisUnit);
  }
}
