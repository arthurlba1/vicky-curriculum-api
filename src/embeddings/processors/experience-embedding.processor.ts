import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { EXPERIENCE_EMBEDDING_QUEUE } from '../queues/embedding.queue';
import { ExperienceEmbeddingJobData } from '../interfaces/embedding-job.interface';
import { EmbeddingsService } from '../embeddings.service';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceType } from '@/experiences/types/experience.types';

/**
 * Processor for experience embedding jobs
 */
@Processor(EXPERIENCE_EMBEDDING_QUEUE)
@Injectable()
export class ExperienceEmbeddingProcessor extends WorkerHost {
  private readonly logger = new Logger(ExperienceEmbeddingProcessor.name);

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
  ) {
    super();
  }

  async process(job: Job<ExperienceEmbeddingJobData>): Promise<void> {
    const { experienceId, experienceType, description } = job.data;

    this.logger.log(
      `Processing experience embedding job: ${experienceId} (${experienceType})`,
    );

    try {
      if (!description || description.trim().length === 0) {
        this.logger.warn(
          `Skipping embedding generation for experience ${experienceId}: empty description`,
        );
        return;
      }

      // Generate embedding
      const { embedding, model } = await this.embeddingsService.generateEmbedding(description);

      const repository = this.experienceRepositoryFactory.getRepository(experienceType);

      await repository.update(experienceId, {
        embedding,
        embeddingModel: model,
      } as any);

      this.logger.log(
        `Successfully generated and saved embedding for experience ${experienceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process experience embedding job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error; // Let BullMQ handle retry
    }
  }
}
