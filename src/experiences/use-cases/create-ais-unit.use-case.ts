import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { CreateAisUnitInput } from '@/experiences/dto/ais-unit/create-ais-unit.input';
import { AisUnitResponse } from '@/experiences/dto/ais-unit/ais-unit.response';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { mapAisUnitToResponse } from '@/experiences/mappers/experience.mapper';
import { EmbeddingsService } from '@/embeddings/embeddings.service';
import { unifyAisUnitToText } from '@/experiences/utils/unify-ais-unit';

export interface CreateAisUnitUseCaseInput {
  userId: string;
  experienceType: ExperienceType;
  experienceId: string;
  aisUnit: CreateAisUnitInput;
}

@Injectable()
export class CreateAisUnitUseCase
  implements UseCase<CreateAisUnitUseCaseInput, AisUnitResponse>
{
  private readonly logger = new Logger(CreateAisUnitUseCase.name);

  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async execute(input: CreateAisUnitUseCaseInput): Promise<AisUnitResponse> {
    await this.ensureExperienceOwnership(input);

    const aisUnit = await this.aisUnitsRepository.createUnit({
      ...input.aisUnit,
      experienceId: input.experienceId,
      experienceType: input.experienceType,
    });

    await this.generateEmbedding(aisUnit);

    return mapAisUnitToResponse(aisUnit);
  }

  private async ensureExperienceOwnership(input: CreateAisUnitUseCaseInput) {
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
  }

  private async generateEmbedding(aisUnit: AisUnitResponse) {
    try {
      const unifiedText = unifyAisUnitToText(aisUnit);

      if (!unifiedText?.trim()) {
        this.logger.warn(`Empty unified text for AIS unit ${aisUnit.id}`);
        return;
      }

      const { embedding, model } = await this.embeddingsService.generateEmbedding(
        unifiedText,
      );
      await this.aisUnitsRepository.updateEmbedding(aisUnit.id, embedding, model);
    } catch (error) {
      this.logger.error(`Failed to generate embedding for AIS unit ${aisUnit.id}:`, error);
    }
  }
}
