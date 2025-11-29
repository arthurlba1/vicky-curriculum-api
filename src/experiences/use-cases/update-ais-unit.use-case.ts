import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { UpdateAisUnitInput } from '@/experiences/dto/ais-unit/update-ais-unit.input';
import { AisUnitResponse } from '@/experiences/dto/ais-unit/ais-unit.response';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { mapAisUnitToResponse } from '@/experiences/mappers/experience.mapper';
// Embedding generation disabled
// import { EmbeddingsService } from '@/embeddings/embeddings.service';
// import { unifyAisUnitToText } from '@/experiences/utils/unify-ais-unit';

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
  private readonly logger = new Logger(UpdateAisUnitUseCase.name);

  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
    // Embedding generation disabled
    // private readonly embeddingsService: EmbeddingsService,
  ) {}

  async execute(input: UpdateAisUnitUseCaseInput): Promise<AisUnitResponse> {
    await this.ensureExperienceOwnership(input);

    const existingAisUnit = await this.aisUnitsRepository.findById(input.aisUnit.id);
    if (!existingAisUnit) {
      throw new NotFoundException('AIS Unit not found');
    }

    this.validateAisUnitOwnership(existingAisUnit, input);

    const previousAction = existingAisUnit.action?.trim();

    const updatedAisUnit = await this.aisUnitsRepository.updateUnit(input.aisUnit.id, {
      action: input.aisUnit.action,
      impact: input.aisUnit.impact,
      context: input.aisUnit.context,
      skills: input.aisUnit.skills,
    });

    // Embedding generation disabled
    // await this.regenerateEmbeddingIfNeeded(updatedAisUnit, previousAction);

    return mapAisUnitToResponse(updatedAisUnit);
  }

  private async ensureExperienceOwnership(input: UpdateAisUnitUseCaseInput): Promise<void> {
    const repository = this.experienceRepositoryFactory.getRepository(input.experienceType);

    const experience = await repository.findByIdAndUserId(input.experienceId, input.userId);

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }
  }

  private validateAisUnitOwnership(
    aisUnit: { experienceId: string; experienceType: ExperienceType },
    input: UpdateAisUnitUseCaseInput,
  ): void {
    if (aisUnit.experienceId !== input.experienceId || aisUnit.experienceType !== input.experienceType) {
      throw new ForbiddenException('AIS Unit does not belong to this experience');
    }
  }

  // Embedding generation disabled
  // /**
  //  * Regenerate embedding if the action field changed
  //  * Uses unified text directly without enrichment
  //  */
  // private async regenerateEmbeddingIfNeeded(
  //   aisUnit: AisUnitResponse,
  //   previousAction?: string,
  // ): Promise<void> {
  //   try {
  //     const currentAction = aisUnit.action?.trim();
  //     if (!currentAction) {
  //       return;
  //     }

  //     if (previousAction && previousAction === currentAction) {
  //       return;
  //     }

  //     const unifiedText = unifyAisUnitToText(aisUnit);

  //     if (!unifiedText?.trim()) {
  //       this.logger.warn(`Empty unified text for AIS unit ${aisUnit.id}`);
  //       return;
  //     }

  //     const { embedding, model } = await this.embeddingsService.generateEmbedding(unifiedText);

  //     await this.aisUnitsRepository.updateEmbedding(aisUnit.id, embedding, model);
  //   } catch (error) {
  //     this.logger.error(`Failed to generate embedding for AIS unit ${aisUnit.id}:`, error);
  //   }
  // }
}
