import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { UpdateAisUnitInput } from '@/experiences/dto/update-ais-unit.input';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { mapAisUnitToResponse } from '@/experiences/mappers/experience.mapper';
// import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';
import { EmbeddingsService } from '@/embeddings/embeddings.service';

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
    // private readonly embeddingQueue: EmbeddingQueue,
    private readonly embeddingsService: EmbeddingsService,
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

    try {
      const unifiedText = this.embeddingsService.unifyAisUnitToText({
        action: updatedAisUnit.action,
        impact: updatedAisUnit.impact,
        context: updatedAisUnit.context,
        skills: updatedAisUnit.skills,
      });

      if (unifiedText && unifiedText.trim().length > 0) {
        const { embedding, model } = await this.embeddingsService.generateEmbedding(unifiedText);
        await this.aisUnitsRepository.update(updatedAisUnit.id, {
          embedding,
          embeddingModel: model,
        });
      }
    } catch (error) {
      console.error(`Failed to generate embedding for AIS unit ${updatedAisUnit.id}:`, error);
    }

    return mapAisUnitToResponse(updatedAisUnit);
  }
}
