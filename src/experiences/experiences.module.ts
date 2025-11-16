import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';
import { AisUnit } from '@/experiences/entities/ais-unit.entity';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { ProjectExperiencesRepository } from '@/experiences/repositories/project-experiences.repository';
import { AcademicExperiencesRepository } from '@/experiences/repositories/academic-experiences.repository';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { CheckExperienceOwnershipUseCase } from '@/experiences/use-cases/check-experience-ownership.use-case';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ListExperiencesUseCase } from '@/experiences/use-cases/list-experiences.use-case';
import { ListAllExperiencesUseCase } from '@/experiences/use-cases/list-all-experiences.use-case';
import { CreateExperienceUseCase } from '@/experiences/use-cases/create-experience.use-case';
import { UpdateExperienceUseCase } from '@/experiences/use-cases/update-experience.use-case';
import { RemoveExperienceUseCase } from '@/experiences/use-cases/remove-experience.use-case';
import { ListAisUnitsByExperienceUseCase } from '@/experiences/use-cases/list-ais-units-by-experience.use-case';
import { CreateAisUnitUseCase } from '@/experiences/use-cases/create-ais-unit.use-case';
import { UpdateAisUnitUseCase } from '@/experiences/use-cases/update-ais-unit.use-case';
import { RemoveAisUnitUseCase } from '@/experiences/use-cases/remove-ais-unit.use-case';
import { ExperiencesController } from '@/experiences/experiences.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfessionalExperience,
      ProjectExperience,
      AcademicExperience,
      AisUnit,
    ]),
  ],
  controllers: [ExperiencesController],
  providers: [
    ProfessionalExperiencesRepository,
    ProjectExperiencesRepository,
    AcademicExperiencesRepository,
    AisUnitsRepository,
    ExperienceRepositoryFactory,
    CheckExperienceOwnershipUseCase,
    ListExperiencesUseCase,
    ListAllExperiencesUseCase,
    CreateExperienceUseCase,
    UpdateExperienceUseCase,
    RemoveExperienceUseCase,
    ListAisUnitsByExperienceUseCase,
    CreateAisUnitUseCase,
    UpdateAisUnitUseCase,
    RemoveAisUnitUseCase,
  ],
  exports: [
    ProfessionalExperiencesRepository,
    ProjectExperiencesRepository,
    AcademicExperiencesRepository,
    AisUnitsRepository,
    ExperienceRepositoryFactory,
    CheckExperienceOwnershipUseCase,
    ListExperiencesUseCase,
    ListAllExperiencesUseCase,
    CreateExperienceUseCase,
    UpdateExperienceUseCase,
    RemoveExperienceUseCase,
    ListAisUnitsByExperienceUseCase,
    CreateAisUnitUseCase,
    UpdateAisUnitUseCase,
    RemoveAisUnitUseCase,
  ],
})

export class ExperiencesModule {}
