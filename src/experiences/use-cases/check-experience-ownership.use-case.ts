import { Injectable, NotFoundException } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { ProjectExperiencesRepository } from '@/experiences/repositories/project-experiences.repository';
import { AcademicExperiencesRepository } from '@/experiences/repositories/academic-experiences.repository';

export interface CheckExperienceOwnershipInput {
  experienceId: string;
  experienceType: ExperienceType;
  userId: string;
}

@Injectable()
export class CheckExperienceOwnershipUseCase
  implements UseCase<CheckExperienceOwnershipInput, boolean>
{
  constructor(
    private readonly professionalExperiencesRepository: ProfessionalExperiencesRepository,
    private readonly projectExperiencesRepository: ProjectExperiencesRepository,
    private readonly academicExperiencesRepository: AcademicExperiencesRepository,
  ) {}

  async execute(input: CheckExperienceOwnershipInput): Promise<boolean> {
    const repository = this.getRepositoryByType(input.experienceType);
    const experience = await repository.findByIdAndUserId(input.experienceId, input.userId);
    return Boolean(experience);
  }

  private getRepositoryByType(experienceType: ExperienceType) {
    switch (experienceType) {
      case ExperienceType.WORK:
        return this.professionalExperiencesRepository;
      case ExperienceType.PROJECT:
        return this.projectExperiencesRepository;
      case ExperienceType.EDUCATION:
        return this.academicExperiencesRepository;
      default:
        throw new NotFoundException(`Unknown experience type: ${experienceType}`);
    }
  }
}
