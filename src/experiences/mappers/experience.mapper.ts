import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { ExperienceType } from '@/experiences/types/experience.types';
import { CreateAcademicExperienceInput } from '@/experiences/dto/create-academic-experience.input';
import { CreateProjectExperienceInput } from '@/experiences/dto/create-project-experience.input';
import { CreateWorkExperienceInput } from '@/experiences/dto/create-work-experience.input';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import { AisUnit } from '@/experiences/entities/ais-unit.entity';
import { AisUnitResponse } from '@/experiences/dto/ais-unit/ais-unit.response';

export const mapExperienceToSummary = (
  experienceType: ExperienceType,
  experience: ProfessionalExperience | ProjectExperience | AcademicExperience,
): ExperienceSummary => {
  return Object.assign(new ExperienceSummary(), {
    id: experience.id,
    userId: experience.userId,
    experienceType,
    createdAt: experience.createdAt,
    updatedAt: experience.updatedAt,
    payload: extractExperiencePayload(experienceType, experience),
  });
};

/**
 * Maps an AIS Unit entity to a response DTO
 * Includes all base fields plus metadata
 */
export const mapAisUnitToResponse = (aisUnit: AisUnit): AisUnitResponse => {
  const response = Object.assign(new AisUnitResponse(), {
    id: aisUnit.id,
    experienceId: aisUnit.experienceId,
    experienceType: aisUnit.experienceType,
    action: aisUnit.action,
    impact: aisUnit.impact,
    context: aisUnit.context,
    skills: aisUnit.skills,
    createdAt: aisUnit.createdAt,
    updatedAt: aisUnit.updatedAt,
  });
  return response;
};

const extractExperiencePayload = (
  experienceType: ExperienceType,
  experience: ProfessionalExperience | ProjectExperience | AcademicExperience,
) => {
  switch (experienceType) {
    case ExperienceType.PROFESSIONAL: {
      const work = experience as ProfessionalExperience;
      return {
        companyName: work.companyName,
        role: work.role,
        location: work.location,
        startDate: work.startDate,
        endDate: work.endDate,
        generalDescription: work.generalDescription,
      };
    }
    case ExperienceType.PROJECT: {
      const project = experience as ProjectExperience;
      return {
        projectName: project.projectName,
        companyName: project.companyName,
        repoUrl: project.repoUrl,
        projectUrl: project.projectUrl,
        startDate: project.startDate,
        endDate: project.endDate,
        description: project.description,
      };
    }
    case ExperienceType.ACADEMIC: {
      const academic = experience as AcademicExperience;
      return {
        institution: academic.institution,
        course: academic.course,
        location: academic.location,
        startDate: academic.startDate,
        endDate: academic.endDate,
        description: academic.description,
      };
    }
    default:
      return {};
  }
};

export const mapExperienceInputToEntityPayload = (
  experienceType: ExperienceType,
  experienceInput:
    | CreateWorkExperienceInput
    | CreateProjectExperienceInput
    | CreateAcademicExperienceInput,
) => {
  const parseDate = (value?: string) => (value ? new Date(value) : undefined);

  // Access fields directly from the object since it may come as a plain object
  const input = experienceInput as any;

  switch (experienceType) {
    case ExperienceType.PROFESSIONAL: {
      return {
        companyName: input.companyName,
        role: input.role,
        location: input.location,
        startDate: parseDate(input.startDate),
        endDate: parseDate(input.endDate),
        generalDescription: input.generalDescription,
      };
    }
    case ExperienceType.PROJECT: {
      return {
        projectName: input.projectName,
        companyName: input.companyName,
        repoUrl: input.repoUrl,
        projectUrl: input.projectUrl,
        startDate: parseDate(input.startDate),
        endDate: parseDate(input.endDate),
        description: input.description,
      };
    }
    case ExperienceType.ACADEMIC: {
      return {
        institution: input.institution,
        course: input.course,
        location: input.location || null,
        startDate: parseDate(input.startDate),
        endDate: parseDate(input.endDate),
        description: input.description || null,
      };
    }
    default:
      return {};
  }
};
