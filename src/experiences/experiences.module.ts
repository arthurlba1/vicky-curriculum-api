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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfessionalExperience,
      ProjectExperience,
      AcademicExperience,
      AisUnit,
    ]),
  ],
  providers: [
    ProfessionalExperiencesRepository,
    ProjectExperiencesRepository,
    AcademicExperiencesRepository,
    AisUnitsRepository,
    CheckExperienceOwnershipUseCase,
  ],
  exports: [
    ProfessionalExperiencesRepository,
    ProjectExperiencesRepository,
    AcademicExperiencesRepository,
    AisUnitsRepository,
    CheckExperienceOwnershipUseCase,
  ],
})
export class ExperiencesModule {}
