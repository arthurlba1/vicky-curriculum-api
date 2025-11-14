import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';

export interface RemoveExperienceUseCaseInput {
  userId: string;
  experienceId: string;
  experienceType: ExperienceType;
}

@Injectable()
export class RemoveExperienceUseCase
  implements UseCase<RemoveExperienceUseCaseInput, void>
{
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
  ) {}

  async execute(input: RemoveExperienceUseCaseInput): Promise<void> {
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

    await this.aisUnitsRepository.deleteByExperience(
      input.experienceId,
      input.experienceType,
    );

    await repository.deleteById(input.experienceId, input.userId);
  }
}
