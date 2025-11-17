import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmbeddingsService } from './embeddings.service';
import { EmbeddingQueue } from './queues/embedding.queue';
import {
  EXPERIENCE_EMBEDDING_QUEUE,
  AIS_UNIT_EMBEDDING_QUEUE,
  JOB_POSTING_QUEUE,
} from '@/embeddings/queues/embedding.queue';
import { ExperienceEmbeddingProcessor } from './processors/experience-embedding.processor';
import { AisUnitEmbeddingProcessor } from './processors/ais-unit-embedding.processor';
import { JobPostingEmbeddingProcessor } from './processors/job-posting-embedding.processor';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';
import { AisUnit } from '@/experiences/entities/ais-unit.entity';
import { JobPosting } from '@/job-postings/entities/job-posting.entity';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { ProjectExperiencesRepository } from '@/experiences/repositories/project-experiences.repository';
import { AcademicExperiencesRepository } from '@/experiences/repositories/academic-experiences.repository';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { JobPostingsRepository } from '@/job-postings/repositories/job-postings.repository';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ProfessionalExperience,
      ProjectExperience,
      AcademicExperience,
      AisUnit,
      JobPosting,
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: EXPERIENCE_EMBEDDING_QUEUE,
      },
      {
        name: AIS_UNIT_EMBEDDING_QUEUE,
      },
      {
        name: JOB_POSTING_QUEUE,
      },
    ),
  ],
  providers: [
    EmbeddingsService,
    EmbeddingQueue,
    ExperienceEmbeddingProcessor,
    AisUnitEmbeddingProcessor,
    JobPostingEmbeddingProcessor,
    ProfessionalExperiencesRepository,
    ProjectExperiencesRepository,
    AcademicExperiencesRepository,
    AisUnitsRepository,
    ExperienceRepositoryFactory,
    JobPostingsRepository,
  ],
  exports: [EmbeddingsService, EmbeddingQueue],
})

export class EmbeddingsModule {}
