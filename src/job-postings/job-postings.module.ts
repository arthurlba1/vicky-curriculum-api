import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobPosting } from './entities/job-posting.entity';
import { JobPostingsRepository } from './repositories/job-postings.repository';
import { CreateJobPostingUseCase } from './use-cases/create-job-posting.use-case';
import { JobPostingsController } from './job-postings.controller';
import { EmbeddingsModule } from '@/embeddings/embeddings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting]),
    EmbeddingsModule,
  ],
  controllers: [JobPostingsController],
  providers: [
    JobPostingsRepository,
    CreateJobPostingUseCase,
  ],
  exports: [JobPostingsRepository, CreateJobPostingUseCase],
})

export class JobPostingsModule {}
