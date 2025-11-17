import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { AIS_UNIT_EMBEDDING_QUEUE } from '@/embeddings/queues/embedding.queue';
import {
  AisUnitEmbeddingJobData,
  AisUnitBatchEmbeddingJobData,
} from '@/embeddings/interfaces/embedding-job.interface';
import { EmbeddingsService } from '../embeddings.service';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';

/**
 * Processor for AIS Unit embedding jobs (single and batch)
 */
@Processor(AIS_UNIT_EMBEDDING_QUEUE)
@Injectable()
export class AisUnitEmbeddingProcessor extends WorkerHost {
  private readonly logger = new Logger(AisUnitEmbeddingProcessor.name);

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly aisUnitsRepository: AisUnitsRepository,
  ) {
    super();
  }

  async process(
    job: Job<AisUnitEmbeddingJobData | AisUnitBatchEmbeddingJobData>,
  ): Promise<void> {
    const jobName = job.name;

    if (jobName === 'generate-ais-unit-batch-embedding') {
      await this.processBatch(job as Job<AisUnitBatchEmbeddingJobData>);
    } else {
      await this.processSingle(job as Job<AisUnitEmbeddingJobData>);
    }
  }

  /**
   * Process a single AIS Unit embedding
   */
  private async processSingle(job: Job<AisUnitEmbeddingJobData>): Promise<void> {
    const { aisUnitId, action, impact, context, skills } = job.data;

    this.logger.log(`Processing AIS Unit embedding job: ${aisUnitId}`);

    try {
      // Unify AIS Unit data into text
      const unifiedText = this.embeddingsService.unifyAisUnitToText({
        action,
        impact,
        context,
        skills,
      });

      if (!unifiedText || unifiedText.trim().length === 0) {
        this.logger.warn(
          `Skipping embedding generation for AIS Unit ${aisUnitId}: empty text`,
        );
        return;
      }

      // Generate embedding
      const { embedding, model } =
        await this.embeddingsService.generateEmbedding(unifiedText);

      // Update AIS Unit with embedding
      await this.aisUnitsRepository.update(aisUnitId, {
        embedding,
        embeddingModel: model,
      });

      this.logger.log(
        `Successfully generated and saved embedding for AIS Unit ${aisUnitId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process AIS Unit embedding job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error; // Let BullMQ handle retry
    }
  }

  /**
   * Process a batch of AIS Unit embeddings
   */
  private async processBatch(job: Job<AisUnitBatchEmbeddingJobData>): Promise<void> {
    const { units } = job.data;

    this.logger.log(`Processing batch AIS Unit embedding job: ${units.length} units`);

    try {
      // Unify all AIS Units into texts
      const texts = units.map((unit) =>
        this.embeddingsService.unifyAisUnitToText({
          action: unit.action,
          impact: unit.impact,
          context: unit.context,
          skills: unit.skills,
        }),
      );

      // Filter out empty texts
      const validTexts: string[] = [];
      const validUnits: typeof units = [];
      for (let i = 0; i < texts.length; i++) {
        if (texts[i] && texts[i].trim().length > 0) {
          validTexts.push(texts[i]);
          validUnits.push(units[i]);
        }
      }

      if (validTexts.length === 0) {
        this.logger.warn('Skipping batch embedding: all texts are empty');
        return;
      }

      // Generate embeddings in batch
      const { embeddings, model } =
        await this.embeddingsService.generateEmbeddingsBatch(validTexts);

      // Update all AIS Units with their embeddings
      await Promise.all(
        validUnits.map((unit, index) =>
          this.aisUnitsRepository.update(unit.aisUnitId, {
            embedding: embeddings[index],
            embeddingModel: model,
          }),
        ),
      );

      this.logger.log(
        `Successfully generated and saved embeddings for ${validUnits.length} AIS Units`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process batch AIS Unit embedding job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error; // Let BullMQ handle retry
    }
  }
}
