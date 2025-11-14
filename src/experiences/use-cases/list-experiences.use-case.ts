import { Injectable } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import { mapExperienceToSummary } from '@/experiences/mappers/experience.mapper';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';

export interface ListExperiencesInput {
  userId: string;
  experienceType: ExperienceType;
}

@Injectable()
export class ListExperiencesUseCase implements UseCase<ListExperiencesInput, ExperienceSummary[]> {
  constructor(private readonly experienceRepositoryFactory: ExperienceRepositoryFactory) {}

  async execute(input: ListExperiencesInput): Promise<ExperienceSummary[]> {
    const repository = this.experienceRepositoryFactory.getRepository(input.experienceType);
    const experiences = await repository.findByUserId(input.userId);

    return experiences.map((experience: ProfessionalExperience | ProjectExperience | AcademicExperience) =>
      mapExperienceToSummary(input.experienceType, experience),
    );
  }
}
