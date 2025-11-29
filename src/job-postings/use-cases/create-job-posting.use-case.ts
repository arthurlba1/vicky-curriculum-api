import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { UseCase } from '@/core/application/use-case.interface';
import { CreateJobPostingInput } from '../dto/create-job-posting.input';
import { JobPostingResponse } from '../dto/job-posting.response';
import { JobPostingsRepository } from '../repositories/job-postings.repository';
import { JobPostingStatus } from '../entities/job-posting.entity';
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
    private readonly embeddingsService: EmbeddingsService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  async execute(
    input: CreateJobPostingUseCaseInput,
  ): Promise<JobPostingResponse> {
    const jobPosting = await this.createProcessingJobPosting(input);

    if (!this.hasValidRawText(input.rawText)) {
      await this.markJobPostingAsFailed(jobPosting.id, input.userId);
      return this.buildResponse(jobPosting, JobPostingStatus.FAILED);
    }

    try {
      await this.processJobPosting(jobPosting.id, input);
      const updatedJobPosting = await this.jobPostingsRepository.findByIdAndUserId(
        jobPosting.id,
        input.userId,
      );
      return this.buildResponse(updatedJobPosting!, JobPostingStatus.DONE);
    } catch (error) {
      this.logger.error(
        `Failed to process job posting ${jobPosting.id}: ${error.message}`,
        error.stack,
      );

      await this.markJobPostingAsFailed(jobPosting.id, input.userId);
      const failedJobPosting = await this.jobPostingsRepository.findByIdAndUserId(
        jobPosting.id,
        input.userId,
      );
      return this.buildResponse(failedJobPosting!, JobPostingStatus.FAILED);
    }
  }

  private async createProcessingJobPosting(
    input: CreateJobPostingUseCaseInput,
  ): Promise<JobPostingResponse> {
    return this.jobPostingsRepository.createJobPosting(
      {
        rawText: input.rawText,
        status: JobPostingStatus.PROCESSING,
      },
      input.userId,
    );
  }

  private hasValidRawText(rawText?: string): boolean {
    return Boolean(rawText && rawText.trim().length > 0);
  }

  private async processJobPosting(
    jobPostingId: string,
    input: CreateJobPostingUseCaseInput,
  ) {
    // First, generate summary with enriched description
    this.logger.log(`Generating LLM summary for job posting ${jobPostingId}`);
    const summaryJson = await this.generateSummaryWithLLM(input.rawText);

    // Extract enriched description from summary
    const enrichedDescription = (summaryJson.description as string) || input.rawText;

    if (!enrichedDescription?.trim()) {
      throw new Error('Summary did not return a valid description');
    }

    // Embed the enriched description using large model
    this.logger.log(`Generating embedding for job posting ${jobPostingId} (large model)`);
    const { embedding, model } = await this.embeddingsService.generateEmbedding(
      enrichedDescription,
    );

    await this.jobPostingsRepository.updateEmbedding(
      jobPostingId,
      input.userId,
      embedding,
      model,
    );

    await this.jobPostingsRepository.update(
      { id: jobPostingId, userId: input.userId },
      { summaryJson, status: JobPostingStatus.DONE },
    );

    this.logger.log(`Successfully processed job posting ${jobPostingId}`);
  }

  private async markJobPostingAsFailed(id: string, userId: string) {
    try {
      await this.jobPostingsRepository.update(
        { id, userId },
        { status: JobPostingStatus.FAILED },
      );
    } catch (error) {
      this.logger.error(
        `Failed to update job posting ${id} status to FAILED: ${error.message}`,
      );
    }
  }

  private buildResponse(
    jobPosting: JobPostingResponse,
    status: JobPostingStatus,
  ): JobPostingResponse {
    return {
      id: jobPosting.id,
      userId: jobPosting.userId,
      rawText: jobPosting.rawText,
      status,
      summaryJson: jobPosting.summaryJson,
      createdAt: jobPosting.createdAt,
      updatedAt: jobPosting.updatedAt,
    };
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
