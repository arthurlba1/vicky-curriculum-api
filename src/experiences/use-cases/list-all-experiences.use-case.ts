import { Injectable } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';
import { ExperienceWithAisUnitsResponseDto } from '@/experiences/dto/experience-with-ais-units.response';
import { AllExperiencesResponseDto } from '@/experiences/dto/all-experiences.response';
import { mapExperienceToSummary, mapAisUnitToResponse } from '@/experiences/mappers/experience.mapper';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';

export interface ListAllExperiencesInput {
  userId: string;
}

@Injectable()
export class ListAllExperiencesUseCase
  implements UseCase<ListAllExperiencesInput, AllExperiencesResponseDto>
{
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
  ) {}

  async execute(input: ListAllExperiencesInput): Promise<AllExperiencesResponseDto> {
    const [professionalExperiences, projectExperiences, academicExperiences] = await Promise.all([
      this.experienceRepositoryFactory
        .getRepository(ExperienceType.PROFESSIONAL)
        .findByUserId(input.userId),
      this.experienceRepositoryFactory
        .getRepository(ExperienceType.PROJECT)
        .findByUserId(input.userId),
      this.experienceRepositoryFactory
        .getRepository(ExperienceType.ACADEMIC)
        .findByUserId(input.userId),
    ]);

    const [professionalWithAis, projectWithAis, academicWithAis] = await Promise.all([
      this.enrichExperiencesWithAisUnits(
        professionalExperiences as ProfessionalExperience[],
        ExperienceType.PROFESSIONAL,
      ),
      this.enrichExperiencesWithAisUnits(projectExperiences as ProjectExperience[], ExperienceType.PROJECT),
      this.enrichExperiencesWithAisUnits(academicExperiences as AcademicExperience[], ExperienceType.ACADEMIC),
    ]);

    return {
      professional: professionalWithAis,
      academic: academicWithAis,
      project: projectWithAis,
    };
  }

  private async enrichExperiencesWithAisUnits(
    experiences: ProfessionalExperience[] | ProjectExperience[] | AcademicExperience[],
    experienceType: ExperienceType,
  ): Promise<ExperienceWithAisUnitsResponseDto[]> {
    return Promise.all(
      experiences.map(async (experience) => {
        const experienceSummary = mapExperienceToSummary(experienceType, experience);
        const aisUnits = await this.aisUnitsRepository.findByExperience(experience.id, experienceType);
        const aisUnitsResponse = aisUnits.map(mapAisUnitToResponse);

        const seen = new Set<string>();
        for (const unit of aisUnits) {
          for (const skill of unit.skills ?? []) {
            if (typeof skill === 'string' && !seen.has(skill)) {
              seen.add(skill);
            }
          }
        }

        return {
          experience: experienceSummary,
          aisUnits: aisUnitsResponse,
          skills: Array.from(seen),
        };
      }),
    );
  }
}
