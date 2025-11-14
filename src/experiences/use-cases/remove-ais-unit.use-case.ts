import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';

export interface RemoveAisUnitUseCaseInput {
  userId: string;
  experienceType: ExperienceType;
  experienceId: string;
  aisUnitId: string;
}

@Injectable()
export class RemoveAisUnitUseCase implements UseCase<RemoveAisUnitUseCaseInput, void> {
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
  ) {}

  async execute(input: RemoveAisUnitUseCaseInput): Promise<void> {
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

    const aisUnit = await this.aisUnitsRepository.findById(input.aisUnitId);
    if (!aisUnit) {
      throw new NotFoundException('AIS Unit not found');
    }

    if (
      aisUnit.experienceId !== input.experienceId ||
      aisUnit.experienceType !== input.experienceType
    ) {
      throw new ForbiddenException('AIS Unit does not belong to this experience');
    }

    await this.aisUnitsRepository.deleteById(input.aisUnitId);
  }
}
