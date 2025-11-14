import { UpdateExperienceUseCase } from '@/experiences/use-cases/update-experience.use-case';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { NotFoundException } from '@nestjs/common';

describe('UpdateExperienceUseCase', () => {
  let useCase: UpdateExperienceUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let professionalRepository: jest.Mocked<ProfessionalExperiencesRepository>;
  let aisUnitsRepository: jest.Mocked<AisUnitsRepository>;

  const input = {
    userId: 'user-id',
    experienceId: 'experience-id',
    experienceType: ExperienceType.WORK,
    experience: {
      companyName: 'Company Updated',
      role: 'Lead Developer',
      startDate: '2022-01-01',
    },
    aisUnits: [
      {
        action: 'Refactored architecture',
        impact: 'Improved maintainability',
        context: 'Legacy system overhaul',
        skills: ['architecture', 'refactoring'],
      },
    ],
  };

  beforeEach(() => {
    professionalRepository = {
      findByIdAndUserId: jest.fn(),
      updateExperience: jest.fn(),
    } as unknown as jest.Mocked<ProfessionalExperiencesRepository>;

    experienceRepositoryFactory = {
      getRepository: jest.fn().mockReturnValue(professionalRepository),
    } as unknown as jest.Mocked<ExperienceRepositoryFactory>;

    aisUnitsRepository = {
      deleteByExperience: jest.fn(),
      createUnit: jest.fn(),
    } as unknown as jest.Mocked<AisUnitsRepository>;

    useCase = new UpdateExperienceUseCase(
      experienceRepositoryFactory,
      aisUnitsRepository,
    );
  });

  it('should update experience and replace AIS units', async () => {
    const existingExperience = { id: input.experienceId, userId: input.userId } as any;
    const updatedExperience = {
      id: input.experienceId,
      userId: input.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    const aisUnit = {
      id: 'ais-id',
      ...input.aisUnits[0],
      experienceId: input.experienceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    professionalRepository.findByIdAndUserId.mockResolvedValue(existingExperience);
    professionalRepository.updateExperience.mockResolvedValue(updatedExperience);
    aisUnitsRepository.createUnit.mockResolvedValue(aisUnit);

    const result = await useCase.execute(input);

    expect(professionalRepository.findByIdAndUserId).toHaveBeenCalledWith(
      input.experienceId,
      input.userId,
    );
    expect(professionalRepository.updateExperience).toHaveBeenCalledWith(
      input.experienceId,
      input.userId,
      expect.any(Object),
    );
    expect(aisUnitsRepository.deleteByExperience).toHaveBeenCalledWith(
      input.experienceId,
      ExperienceType.WORK,
    );
    expect(aisUnitsRepository.createUnit).toHaveBeenCalled();
    expect(result.aisUnits).toHaveLength(1);
    expect(result.experience.id).toBe(input.experienceId);
  });

  it('should throw NotFoundException when experience is missing', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(professionalRepository.updateExperience).not.toHaveBeenCalled();
  });
});
