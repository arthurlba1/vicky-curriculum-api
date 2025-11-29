import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';
import { AisUnit } from '@/experiences/entities/ais-unit.entity';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { ProjectExperiencesRepository } from '@/experiences/repositories/project-experiences.repository';
import { AcademicExperiencesRepository } from '@/experiences/repositories/academic-experiences.repository';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ListExperiencesUseCase } from '@/experiences/use-cases/list-experiences.use-case';
import { ListAllExperiencesUseCase } from '@/experiences/use-cases/list-all-experiences.use-case';
import { ListExperienceSummaryUseCase } from '@/experiences/use-cases/list-experience-summary.use-case';
import { CreateExperienceUseCase } from '@/experiences/use-cases/create-experience.use-case';
import { UpdateExperienceUseCase } from '@/experiences/use-cases/update-experience.use-case';
import { DeleteExperienceUseCase } from '@/experiences/use-cases/delete-experience.use-case';
import { CreateAisUnitUseCase } from '@/experiences/use-cases/create-ais-unit.use-case';
import { UpdateAisUnitUseCase } from '@/experiences/use-cases/update-ais-unit.use-case';
import { GenerateAisUnitsFromDescriptionUseCase } from '@/experiences/use-cases/generate-ais-units-from-description.use-case';
import { ExperiencesController } from '@/experiences/experiences.controller';
import { EmbeddingsModule } from '@/embeddings/embeddings.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ProfessionalExperience,
      ProjectExperience,
      AcademicExperience,
      AisUnit,
    ]),
    EmbeddingsModule,
  ],
  controllers: [ExperiencesController],
  providers: [
    ProfessionalExperiencesRepository,
    ProjectExperiencesRepository,
    AcademicExperiencesRepository,
    AisUnitsRepository,
    ExperienceRepositoryFactory,
    ListExperiencesUseCase,
    ListAllExperiencesUseCase,
    ListExperienceSummaryUseCase,
    CreateExperienceUseCase,
    UpdateExperienceUseCase,
    DeleteExperienceUseCase,
    CreateAisUnitUseCase,
    UpdateAisUnitUseCase,
    GenerateAisUnitsFromDescriptionUseCase,
  ],
  exports: [
    ProfessionalExperiencesRepository,
    ProjectExperiencesRepository,
    AcademicExperiencesRepository,
    AisUnitsRepository,
    ExperienceRepositoryFactory,
    ListExperiencesUseCase,
    ListAllExperiencesUseCase,
    ListExperienceSummaryUseCase,
    CreateExperienceUseCase,
    UpdateExperienceUseCase,
    DeleteExperienceUseCase,
    CreateAisUnitUseCase,
    UpdateAisUnitUseCase,
    GenerateAisUnitsFromDescriptionUseCase,
  ],
})

export class ExperiencesModule {}
