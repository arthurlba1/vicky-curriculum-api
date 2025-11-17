import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { UseCase } from '@/core/application/use-case.interface';
import { CreateJobPostingInput } from '../dto/create-job-posting.input';
import { JobPostingResponse } from '../dto/job-posting.response';
import { JobPostingsRepository } from '../repositories/job-postings.repository';
import { JobPostingStatus } from '../entities/job-posting.entity';
// import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';
import { EmbeddingsService } from '@/embeddings/embeddings.service';
import { jobPostingSummarySystemPrompt } from '../prompts/job-posting-summary.prompt';

export interface CreateJobPostingUseCaseInput extends CreateJobPostingInput {
  userId: string;
}

@Injectable()
export class CreateJobPostingUseCase
  implements UseCase<CreateJobPostingUseCaseInput, JobPostingResponse>
{
  private readonly logger = new Logger(CreateJobPostingUseCase.name);
  private readonly openai: OpenAI;
  private readonly llmModel = 'gpt-4o-mini';

  constructor(
    private readonly jobPostingsRepository: JobPostingsRepository,
    // private readonly embeddingQueue: EmbeddingQueue,
    private readonly embeddingsService: EmbeddingsService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  async execute(
    input: CreateJobPostingUseCaseInput,
  ): Promise<JobPostingResponse> {
    const jobPosting = await this.jobPostingsRepository.createJobPosting(
      {
        rawText: input.rawText,
        status: JobPostingStatus.PROCESSING,
      },
      input.userId,
    );

    try {
      if (!input.rawText || input.rawText.trim().length === 0) {
        await this.jobPostingsRepository.update(
          { id: jobPosting.id, userId: input.userId },
          { status: JobPostingStatus.FAILED },
        );
        return {
          id: jobPosting.id,
          userId: jobPosting.userId,
          rawText: jobPosting.rawText,
          status: JobPostingStatus.FAILED,
          summaryJson: jobPosting.summaryJson,
          createdAt: jobPosting.createdAt,
          updatedAt: jobPosting.updatedAt,
        };
      }

      this.logger.log(`Generating embedding for job posting ${jobPosting.id}`);
      const { embedding, model } = await this.embeddingsService.generateEmbedding(input.rawText);

      await this.jobPostingsRepository.update(
        { id: jobPosting.id, userId: input.userId },
        {
          embedding,
          embeddingModel: model,
        },
      );

      this.logger.log(`Generating LLM summary for job posting ${jobPosting.id}`);
      const summaryJson = await this.generateSummaryWithLLM(input.rawText);

      await this.jobPostingsRepository.update(
        { id: jobPosting.id, userId: input.userId },
        {
          summaryJson,
          status: JobPostingStatus.DONE,
        },
      );

      this.logger.log(`Successfully processed job posting ${jobPosting.id}`);

      const updatedJobPosting = await this.jobPostingsRepository.findByIdAndUserId(
        jobPosting.id,
        input.userId,
      );

      return {
        id: updatedJobPosting!.id,
        userId: updatedJobPosting!.userId,
        rawText: updatedJobPosting!.rawText,
        status: updatedJobPosting!.status,
        summaryJson: updatedJobPosting!.summaryJson,
        createdAt: updatedJobPosting!.createdAt,
        updatedAt: updatedJobPosting!.updatedAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process job posting ${jobPosting.id}: ${error.message}`,
        error.stack,
      );

      try {
        await this.jobPostingsRepository.update(
          { id: jobPosting.id, userId: input.userId },
          { status: JobPostingStatus.FAILED },
        );
      } catch (updateError) {
        this.logger.error(
          `Failed to update job posting status to FAILED: ${updateError.message}`,
        );
      }

      const failedJobPosting = await this.jobPostingsRepository.findByIdAndUserId(
        jobPosting.id,
        input.userId,
      );

      return {
        id: failedJobPosting!.id,
        userId: failedJobPosting!.userId,
        rawText: failedJobPosting!.rawText,
        status: failedJobPosting!.status,
        summaryJson: failedJobPosting!.summaryJson,
        createdAt: failedJobPosting!.createdAt,
        updatedAt: failedJobPosting!.updatedAt,
      };
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
