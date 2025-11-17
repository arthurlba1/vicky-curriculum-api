import { Injectable } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { CreateJobPostingInput } from '../dto/create-job-posting.input';
import { JobPostingResponse } from '../dto/job-posting.response';
import { JobPostingsRepository } from '../repositories/job-postings.repository';
import { JobPostingStatus } from '../entities/job-posting.entity';
import { EmbeddingQueue } from '@/embeddings/queues/embedding.queue';

export interface CreateJobPostingUseCaseInput extends CreateJobPostingInput {
  userId: string;
}

@Injectable()
export class CreateJobPostingUseCase
  implements UseCase<CreateJobPostingUseCaseInput, JobPostingResponse>
{
  constructor(
    private readonly jobPostingsRepository: JobPostingsRepository,
    private readonly embeddingQueue: EmbeddingQueue,
  ) {}

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

    await this.embeddingQueue.enqueueJobPostingProcessing({
      jobPostingId: jobPosting.id,
      rawText: input.rawText,
      userId: input.userId,
    });

    return {
      id: jobPosting.id,
      userId: jobPosting.userId,
      rawText: jobPosting.rawText,
      status: jobPosting.status,
      summaryJson: jobPosting.summaryJson,
      createdAt: jobPosting.createdAt,
      updatedAt: jobPosting.updatedAt,
    };
  }
}
