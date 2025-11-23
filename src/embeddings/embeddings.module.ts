import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmbeddingsService } from './embeddings.service';
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
  ],
  providers: [
    EmbeddingsService,
    ProfessionalExperiencesRepository,
    ProjectExperiencesRepository,
    AcademicExperiencesRepository,
    AisUnitsRepository,
    ExperienceRepositoryFactory,
    JobPostingsRepository,
  ],
  exports: [EmbeddingsService],
})

export class EmbeddingsModule {}
