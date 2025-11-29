import { Injectable } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { JobPostingsRepository } from '../repositories/job-postings.repository';
import { JobPostingResponse } from '../dto/job-posting.response';

export interface ListJobPostingsInput {
  userId: string;
}

@Injectable()
export class ListJobPostingsUseCase
  implements UseCase<ListJobPostingsInput, JobPostingResponse[]>
{
  constructor(private readonly jobPostingsRepository: JobPostingsRepository) {}

  async execute(input: ListJobPostingsInput): Promise<JobPostingResponse[]> {
    const jobPostings = await this.jobPostingsRepository.findByUserId(input.userId);

    return jobPostings.map((jobPosting) => ({
      id: jobPosting.id,
      userId: jobPosting.userId,
      rawText: jobPosting.rawText,
      status: jobPosting.status,
      summaryJson: jobPosting.summaryJson,
      createdAt: jobPosting.createdAt,
      updatedAt: jobPosting.updatedAt,
    }));
  }
}
