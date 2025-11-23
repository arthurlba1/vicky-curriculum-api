import { Injectable, BadRequestException, Logger } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { CreateExperienceInput } from '@/experiences/dto/create-experience.input';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import {
  mapExperienceInputToEntityPayload,
  mapExperienceToSummary,
} from '@/experiences/mappers/experience.mapper';
import { AisUnitResponse } from '@/experiences/dto/ais-unit/ais-unit.response';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { CreateAisUnitUseCase } from '@/experiences/use-cases/create-ais-unit.use-case';

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
    private readonly createAisUnitUseCase: CreateAisUnitUseCase,
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

    const experience = await repository.createExperience(
      payload as ProfessionalExperience | ProjectExperience | AcademicExperience,
      input.userId,
    );

    const aisUnits = await Promise.all(
      (input.aisUnits ?? []).map((aisUnit) =>
        this.createAisUnitUseCase.execute({
          userId: input.userId,
          experienceType: input.experienceType,
          experienceId: experience.id,
          aisUnit,
        }),
      ),
    );

    return {
      experience: mapExperienceToSummary(input.experienceType, experience),
      aisUnits,
    };
  }
}
