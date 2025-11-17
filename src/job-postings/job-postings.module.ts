import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobPosting } from './entities/job-posting.entity';
import { JobPostingsRepository } from './repositories/job-postings.repository';
import { CreateJobPostingUseCase } from './use-cases/create-job-posting.use-case';
import { FindJobPostingByIdUseCase } from './use-cases/find-job-posting-by-id.use-case';
import { CalculateExperienceMatchUseCase } from './use-cases/calculate-experience-match.use-case';
import { JobPostingsController } from './job-postings.controller';
import { EmbeddingsModule } from '@/embeddings/embeddings.module';
import { ExperiencesModule } from '@/experiences/experiences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting]),
    EmbeddingsModule,
    ExperiencesModule,
  ],
  controllers: [JobPostingsController],
  providers: [
    JobPostingsRepository,
    CreateJobPostingUseCase,
    FindJobPostingByIdUseCase,
    CalculateExperienceMatchUseCase,
  ],
  exports: [JobPostingsRepository, CreateJobPostingUseCase],
})

export class JobPostingsModule {}
