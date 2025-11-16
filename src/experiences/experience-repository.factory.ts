import { Injectable, NotFoundException } from '@nestjs/common';

import { ExperienceType } from '@/experiences/types/experience.types';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { ProjectExperiencesRepository } from '@/experiences/repositories/project-experiences.repository';
import { AcademicExperiencesRepository } from '@/experiences/repositories/academic-experiences.repository';

type ExperienceRepositoryMap = {
  [ExperienceType.PROFESSIONAL]: ProfessionalExperiencesRepository;
  [ExperienceType.PROJECT]: ProjectExperiencesRepository;
  [ExperienceType.ACADEMIC]: AcademicExperiencesRepository;
};

@Injectable()
export class ExperienceRepositoryFactory {
  private readonly repositoryMap: ExperienceRepositoryMap;

  constructor(
    private readonly professionalExperiencesRepository: ProfessionalExperiencesRepository,
    private readonly projectExperiencesRepository: ProjectExperiencesRepository,
    private readonly academicExperiencesRepository: AcademicExperiencesRepository,
  ) {
    this.repositoryMap = {
      [ExperienceType.PROFESSIONAL]: this.professionalExperiencesRepository,
      [ExperienceType.PROJECT]: this.projectExperiencesRepository,
      [ExperienceType.ACADEMIC]: this.academicExperiencesRepository,
    };
  }

  getRepository<T extends ExperienceType>(experienceType: T): ExperienceRepositoryMap[T] {
    const repository = this.repositoryMap[experienceType];
    if (!repository) {
      throw new NotFoundException(`Unsupported experience type: ${experienceType}`);
    }

    return repository;
  }
}
