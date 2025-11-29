import { Injectable } from '@nestjs/common';

import { UseCase } from '@/core/application/use-case.interface';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import { ExperienceSummaryWithSkills } from '@/experiences/dto/experience-summary-with-skills.dto';
import { mapExperienceToSummary } from '@/experiences/mappers/experience.mapper';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';

export interface ListExperienceSummaryInput {
  userId: string;
}

@Injectable()
export class ListExperienceSummaryUseCase
  implements UseCase<ListExperienceSummaryInput, ExperienceSummaryWithSkills[]>
{
  constructor(
    private readonly experienceRepositoryFactory: ExperienceRepositoryFactory,
    private readonly aisUnitsRepository: AisUnitsRepository,
  ) {}

  async execute(input: ListExperienceSummaryInput): Promise<ExperienceSummaryWithSkills[]> {
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

    const allExperiences: Array<{
      experience: ProfessionalExperience | ProjectExperience | AcademicExperience;
      type: ExperienceType;
    }> = [
      ...professionalExperiences.map((exp) => ({ experience: exp, type: ExperienceType.PROFESSIONAL })),
      ...projectExperiences.map((exp) => ({ experience: exp, type: ExperienceType.PROJECT })),
      ...academicExperiences.map((exp) => ({ experience: exp, type: ExperienceType.ACADEMIC })),
    ];

    const experienceIds = allExperiences.map(({ experience }) => experience.id);

    if (experienceIds.length === 0) {
      return [];
    }

    const allAisUnits = await this.aisUnitsRepository
      .createQueryBuilder('ais')
      .select(['ais.experienceId', 'ais.skills'])
      .where('ais.experienceId IN (:...ids)', { ids: experienceIds })
      .getMany();

    const skillsMap = this.buildSkillsMap(allAisUnits);

    return allExperiences.map(({ experience, type }) => {
      const summary = mapExperienceToSummary(type, experience);
      const skills = skillsMap.get(experience.id) || [];

      return Object.assign(new ExperienceSummaryWithSkills(), {
        ...summary,
        skills,
      });
    });
  }

  /**
   * Builds a performant map of experienceId -> unique skills array
   * Uses Set for O(1) deduplication and Map for O(1) lookup
   * Time complexity: O(n * m) where n = AIS units, m = avg skills per unit
   * Space complexity: O(n * m)
   */
  private buildSkillsMap(
    aisUnits: Array<{ experienceId: string; skills: string[] }>,
  ): Map<string, string[]> {
    const skillsMap = new Map<string, Set<string>>();

    for (const unit of aisUnits) {
      if (!unit.skills || unit.skills.length === 0) {
        continue;
      }

      let skillsSet = skillsMap.get(unit.experienceId);
      if (!skillsSet) {
        skillsSet = new Set<string>();
        skillsMap.set(unit.experienceId, skillsSet);
      }

      for (const skill of unit.skills) {
        if (skill && typeof skill === 'string' && skill.trim()) {
          skillsSet.add(skill.trim());
        }
      }
    }

    const result = new Map<string, string[]>();
    for (const [experienceId, skillsSet] of skillsMap.entries()) {
      result.set(experienceId, Array.from(skillsSet));
    }

    return result;
  }
}
