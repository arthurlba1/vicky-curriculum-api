import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { UpdateExperienceInput } from '@/experiences/dto/update-experience.input';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import {
  mapExperienceInputToEntityPayload,
  mapExperienceToSummary,
} from '@/experiences/mappers/experience.mapper';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { AisUnitResponse } from '@/experiences/dto/ais-unit/ais-unit.response';
import { CreateAisUnitInput } from '@/experiences/dto/ais-unit/create-ais-unit.input';
import { UpdateAisUnitInput } from '@/experiences/dto/ais-unit/update-ais-unit.input';
import { CreateAisUnitUseCase } from './create-ais-unit.use-case';
import { UpdateAisUnitUseCase } from './update-ais-unit.use-case';

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
  private readonly logger = new Logger(UpdateExperienceUseCase.name);

  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
    private readonly createAisUnitUseCase: CreateAisUnitUseCase,
    private readonly updateAisUnitUseCase: UpdateAisUnitUseCase,
  ) {}

  async execute(
    input: UpdateExperienceUseCaseInput,
  ): Promise<UpdateExperienceUseCaseOutput> {
    this.logger.log(`Updating experience ${input.experienceId} for user ${input.userId}`);

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

    const aisUnits = await this.syncAisUnits(input, updatedExperience.id);

    return {
      experience: mapExperienceToSummary(input.experienceType, updatedExperience),
      aisUnits,
    };
  }

  /**
   * Synchronizes AIS units for the experience:
   * - Updates existing units (with ID)
   * - Creates new units (without ID)
   * - Removes units not in the input list
   */
  private async syncAisUnits(
    input: UpdateExperienceUseCaseInput,
    experienceId: string,
  ): Promise<AisUnitResponse[]> {
    const inputAisUnits = input.aisUnits ?? [];
    
    const existingAisUnits = await this.aisUnitsRepository.findByExperience(
      experienceId,
      input.experienceType,
    );

    const existingIds = new Set(existingAisUnits.map((unit) => unit.id));

    const hasId = (unit: any): unit is UpdateAisUnitInput => 
      'id' in unit && !!unit.id;

    const inputIds = new Set(
      inputAisUnits
        .filter(hasId)
        .map((unit) => unit.id),
    );

    const unitsToUpdate = inputAisUnits.filter(
      (unit) => hasId(unit) && existingIds.has(unit.id),
    ) as UpdateAisUnitInput[];

    const unitsToCreate = inputAisUnits.filter(
      (unit) => !hasId(unit) || !existingIds.has(unit.id),
    ) as CreateAisUnitInput[];

    const unitsToDelete = existingAisUnits.filter(
      (unit) => !inputIds.has(unit.id),
    );

    const [updatedUnits, createdUnits] = await Promise.all([
      Promise.all(
        unitsToUpdate.map((unit) =>
          this.updateAisUnitUseCase.execute({
            userId: input.userId,
            experienceType: input.experienceType,
            experienceId,
            aisUnit: unit,
          }),
        ),
      ),

      Promise.all(
        unitsToCreate.map((unit) =>
          this.createAisUnitUseCase.execute({
            userId: input.userId,
            experienceType: input.experienceType,
            experienceId,
            aisUnit: unit,
          }),
        ),
      ),
    ]);

    if (unitsToDelete.length > 0) {
      await Promise.all(
        unitsToDelete.map((unit) => this.aisUnitsRepository.deleteById(unit.id)),
      );
    }

    return [...updatedUnits, ...createdUnits];
  }
}
