import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import OpenAI from 'openai';

import { JOB_POSTING_QUEUE } from '@/embeddings/queues/embedding.queue';
import { JobPostingProcessingJobData } from '@/embeddings/interfaces/embedding-job.interface';
import { EmbeddingsService } from '../embeddings.service';
import { JobPostingsRepository } from '@/job-postings/repositories/job-postings.repository';
import { JobPostingStatus } from '@/job-postings/entities/job-posting.entity';
import { jobPostingSummarySystemPrompt } from '@/job-postings/prompts/job-posting-summary.prompt';
import { ConfigService } from '@nestjs/config';

@Processor(JOB_POSTING_QUEUE)
@Injectable()
export class JobPostingEmbeddingProcessor extends WorkerHost {
  private readonly logger = new Logger(JobPostingEmbeddingProcessor.name);
  private readonly openai: OpenAI;
  private readonly llmModel = 'gpt-4o-mini';

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly jobPostingsRepository: JobPostingsRepository,
    private readonly configService: ConfigService,
  ) {
    super();
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  async process(job: Job<JobPostingProcessingJobData>): Promise<void> {
    const { jobPostingId, rawText, userId } = job.data;

    this.logger.log(`Processing job posting: ${jobPostingId}`);

    try {
      if (!rawText || rawText.trim().length === 0) {
        this.logger.warn(
          `Skipping processing for job posting ${jobPostingId}: empty rawText`,
        );
        await this.jobPostingsRepository.update({ id: jobPostingId, userId }, {
          status: JobPostingStatus.FAILED,
        });
        return;
      }

      this.logger.log(`Generating embedding for job posting ${jobPostingId}`);
      const { embedding, model } = await this.embeddingsService.generateEmbedding(rawText);

      await this.jobPostingsRepository.update(
        { id: jobPostingId, userId },
        {
          embedding,
          embeddingModel: model,
        },
      );

      this.logger.log(`Embedding generated and saved for job posting ${jobPostingId}`);

      this.logger.log(`Generating LLM summary for job posting ${jobPostingId}`);
      const summaryJson = await this.generateSummaryWithLLM(rawText);

      await this.jobPostingsRepository.update(
        { id: jobPostingId, userId },
        {
          summaryJson,
          status: JobPostingStatus.DONE,
        },
      );

      this.logger.log(
        `Successfully processed job posting ${jobPostingId}: embedding and summary generated`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process job posting job ${job.id}: ${error.message}`,
        error.stack,
      );

      try {
        await this.jobPostingsRepository.update(
          { id: jobPostingId, userId },
          {
            status: JobPostingStatus.FAILED,
          },
        );
      } catch (updateError) {
        this.logger.error(
          `Failed to update job posting status to FAILED: ${updateError.message}`,
        );
      }

      throw error; // Let BullMQ handle retry
    }
  }

  private async generateSummaryWithLLM(
    rawText: string,
  ): Promise<Record<string, unknown>> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.llmModel,
        messages: [
          { role: 'system', content: jobPostingSummarySystemPrompt },
          { role: 'user', content: `Job Posting Text:\n\n${rawText}` },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' } as any,
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        this.logger.error(`Failed to parse LLM JSON response: ${parseError.message}`);
        throw new Error(`Invalid JSON response from LLM: ${parseError.message}`);
      }
    } catch (error) {
      this.logger.error(`Failed to generate LLM summary: ${error.message}`, error.stack);
      throw error;
    }
  }
}
