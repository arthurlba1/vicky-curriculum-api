import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { JobPostingsRepository } from '../repositories/job-postings.repository';
import { JobPostingResponse } from '../dto/job-posting.response';

export interface FindJobPostingByIdInput {
  id: string;
  userId: string;
}

@Injectable()
export class FindJobPostingByIdUseCase
  implements UseCase<FindJobPostingByIdInput, JobPostingResponse>
{
  constructor(private readonly jobPostingsRepository: JobPostingsRepository) {}

  async execute(input: FindJobPostingByIdInput): Promise<JobPostingResponse> {
    const jobPosting = await this.jobPostingsRepository.findByIdAndUserId(
      input.id,
      input.userId,
    );

    if (!jobPosting) {
      throw new NotFoundException('Job posting not found');
    }

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
