import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';
import { CreateAisUnitInput } from '@/experiences/dto/create-ais-unit.input';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { mapAisUnitToResponse } from '@/experiences/mappers/experience.mapper';
import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';

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
    private readonly embeddingQueue: EmbeddingQueue,
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

    await this.embeddingQueue.enqueueAisUnitEmbedding({
      aisUnitId: aisUnit.id,
      action: aisUnit.action,
      impact: aisUnit.impact,
      context: aisUnit.context,
      skills: aisUnit.skills,
    });

    return mapAisUnitToResponse(aisUnit);
  }
}
