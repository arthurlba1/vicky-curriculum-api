import { ListAisUnitsByExperienceUseCase } from '@/experiences/use-cases/list-ais-units-by-experience.use-case';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceType } from '@/experiences/types/experience.types';
import { NotFoundException } from '@nestjs/common';

describe('ListAisUnitsByExperienceUseCase', () => {
  let useCase: ListAisUnitsByExperienceUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let professionalRepository: jest.Mocked<ProfessionalExperiencesRepository>;
  let aisUnitsRepository: jest.Mocked<AisUnitsRepository>;

  const input = {
    userId: 'user-id',
    experienceType: ExperienceType.WORK,
    experienceId: 'experience-id',
  };

  beforeEach(() => {
    professionalRepository = {
      findByIdAndUserId: jest.fn(),
    } as unknown as jest.Mocked<ProfessionalExperiencesRepository>;

    experienceRepositoryFactory = {
      getRepository: jest.fn().mockReturnValue(professionalRepository),
    } as unknown as jest.Mocked<ExperienceRepositoryFactory>;

    aisUnitsRepository = {
      findByExperience: jest.fn(),
    } as unknown as jest.Mocked<AisUnitsRepository>;

    useCase = new ListAisUnitsByExperienceUseCase(
      experienceRepositoryFactory,
      aisUnitsRepository,
    );
  });

  it('should return experience and ais units', async () => {
    const experience = {
      id: input.experienceId,
      userId: input.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    const aisUnit = {
      id: 'ais-id',
      experienceId: input.experienceId,
      action: 'Did something',
      impact: 'Great result',
      context: 'Some context',
      skills: ['skill'],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    professionalRepository.findByIdAndUserId.mockResolvedValue(experience);
    aisUnitsRepository.findByExperience.mockResolvedValue([aisUnit]);

    const result = await useCase.execute(input);

    expect(professionalRepository.findByIdAndUserId).toHaveBeenCalledWith(
      input.experienceId,
      input.userId,
    );
    expect(aisUnitsRepository.findByExperience).toHaveBeenCalledWith(
      input.experienceId,
      ExperienceType.WORK,
    );
    expect(result.experience.id).toBe(input.experienceId);
    expect(result.aisUnits).toHaveLength(1);
  });

  it('should throw NotFoundException when experience missing', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(aisUnitsRepository.findByExperience).not.toHaveBeenCalled();
  });
});
