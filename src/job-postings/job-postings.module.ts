import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { JobPosting } from './entities/job-posting.entity';
import { JobPostingsRepository } from './repositories/job-postings.repository';
import { CreateJobPostingUseCase } from './use-cases/create-job-posting.use-case';
import { FindJobPostingByIdUseCase } from './use-cases/find-job-posting-by-id.use-case';
import { JobPostingsController } from './job-postings.controller';
import { EmbeddingsModule } from '@/embeddings/embeddings.module';
import { ExperiencesModule } from '@/experiences/experiences.module';
import { ListJobPostingsUseCase } from './use-cases/list-job-postings.use-case';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([JobPosting]),
    EmbeddingsModule,
    ExperiencesModule,
  ],
  controllers: [JobPostingsController],
  providers: [
    JobPostingsRepository,
    CreateJobPostingUseCase,
    FindJobPostingByIdUseCase,
    ListJobPostingsUseCase,
  ],
  exports: [JobPostingsRepository, CreateJobPostingUseCase, ListJobPostingsUseCase],
})

export class JobPostingsModule {}
