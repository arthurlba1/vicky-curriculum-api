import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import {
  ExperienceEmbeddingJobData,
  AisUnitEmbeddingJobData,
  AisUnitBatchEmbeddingJobData,
  JobPostingProcessingJobData,
} from '@/embeddings/interfaces/embedding-job.interface';

/**
 * Queue names for embedding jobs
 */
export const EXPERIENCE_EMBEDDING_QUEUE = 'experience-embedding';
export const AIS_UNIT_EMBEDDING_QUEUE = 'ais-unit-embedding';
export const JOB_POSTING_QUEUE = 'job-posting-processing';

/**
 * Service to enqueue embedding jobs
 */
@Injectable()
export class EmbeddingQueue {
  constructor(
    @InjectQueue(EXPERIENCE_EMBEDDING_QUEUE)
    private readonly experienceEmbeddingQueue: Queue<ExperienceEmbeddingJobData>,
    @InjectQueue(AIS_UNIT_EMBEDDING_QUEUE)
    private readonly aisUnitEmbeddingQueue: Queue<AisUnitEmbeddingJobData | AisUnitBatchEmbeddingJobData>,
    @InjectQueue(JOB_POSTING_QUEUE)
    private readonly jobPostingQueue: Queue<JobPostingProcessingJobData>,
  ) {}

  /**
   * Enqueue job to generate embedding for an experience
   */
  async enqueueExperienceEmbedding(data: ExperienceEmbeddingJobData): Promise<void> {
    await this.experienceEmbeddingQueue.add('generate-experience-embedding', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // 7 days
      },
    });
  }

  /**
   * Enqueue job to generate embedding for a single AIS Unit
   */
  async enqueueAisUnitEmbedding(data: AisUnitEmbeddingJobData): Promise<void> {
    await this.aisUnitEmbeddingQueue.add('generate-ais-unit-embedding', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // 7 days
      },
    });
  }

  /**
   * Enqueue batch job to generate embeddings for multiple AIS Units
   */
  async enqueueAisUnitBatchEmbedding(data: AisUnitBatchEmbeddingJobData): Promise<void> {
    await this.aisUnitEmbeddingQueue.add('generate-ais-unit-batch-embedding', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // 7 days
      },
    });
  }

  /**
   * Enqueue job to process job posting (generate embedding and LLM summary)
   */
  async enqueueJobPostingProcessing(data: JobPostingProcessingJobData): Promise<void> {
    await this.jobPostingQueue.add('process-job-posting', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // 7 days
      },
    });
  }
}
