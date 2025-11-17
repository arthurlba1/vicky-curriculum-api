import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { CreateAisUnitInput } from '@/experiences/dto/create-ais-unit.input';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { mapAisUnitToResponse } from '@/experiences/mappers/experience.mapper';
// import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';
import { EmbeddingsService } from '@/embeddings/embeddings.service';

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
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
    // private readonly embeddingQueue: EmbeddingQueue,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async execute(input: CreateAisUnitUseCaseInput): Promise<AisUnitResponse> {
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

    const aisUnit = await this.aisUnitsRepository.createUnit({
      ...input.aisUnit,
      experienceId: input.experienceId,
      experienceType: input.experienceType,
    });

    try {
      const unifiedText = this.embeddingsService.unifyAisUnitToText({
        action: aisUnit.action,
        impact: aisUnit.impact,
        context: aisUnit.context,
        skills: aisUnit.skills,
      });

      if (unifiedText && unifiedText.trim().length > 0) {
        const { embedding, model } = await this.embeddingsService.generateEmbedding(unifiedText);
        await this.aisUnitsRepository.update(aisUnit.id, {
          embedding,
          embeddingModel: model,
        });
      }
    } catch (error) {
      console.error(`Failed to generate embedding for AIS unit ${aisUnit.id}:`, error);
    }

    return mapAisUnitToResponse(aisUnit);
  }
}
