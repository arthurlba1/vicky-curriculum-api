import { NotFoundException } from '@nestjs/common';

import { ExperienceType } from '@/experiences/types/experience.types';
import { CheckExperienceOwnershipUseCase } from '@/experiences/use-cases/check-experience-ownership.use-case';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { ProjectExperiencesRepository } from '@/experiences/repositories/project-experiences.repository';
import { AcademicExperiencesRepository } from '@/experiences/repositories/academic-experiences.repository';

describe('CheckExperienceOwnershipUseCase', () => {
  let useCase: CheckExperienceOwnershipUseCase;
  let professionalRepo: jest.Mocked<ProfessionalExperiencesRepository>;
  let projectRepo: jest.Mocked<ProjectExperiencesRepository>;
  let academicRepo: jest.Mocked<AcademicExperiencesRepository>;

  const input = {
    experienceId: 'experience-id',
    experienceType: ExperienceType.WORK,
    userId: 'user-id',
  };

  beforeEach(() => {
    professionalRepo = {
      findByIdAndUserId: jest.fn(),
    } as unknown as jest.Mocked<ProfessionalExperiencesRepository>;
    projectRepo = {
      findByIdAndUserId: jest.fn(),
    } as unknown as jest.Mocked<ProjectExperiencesRepository>;
    academicRepo = {
      findByIdAndUserId: jest.fn(),
    } as unknown as jest.Mocked<AcademicExperiencesRepository>;

    useCase = new CheckExperienceOwnershipUseCase(professionalRepo, projectRepo, academicRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when experience belongs to user', async () => {
    professionalRepo.findByIdAndUserId.mockResolvedValue({ id: input.experienceId } as any);

    const result = await useCase.execute(input);

    expect(professionalRepo.findByIdAndUserId).toHaveBeenCalledWith(
      input.experienceId,
      input.userId,
    );
    expect(result).toBe(true);
  });

  it('returns false when experience does not belong to user', async () => {
    professionalRepo.findByIdAndUserId.mockResolvedValue(null);

    const result = await useCase.execute(input);

    expect(result).toBe(false);
  });

  it('throws NotFoundException for unknown experience type', async () => {
    await expect(
      useCase.execute({
        ...input,
        experienceType: 'unknown' as ExperienceType,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
