import { RemoveExperienceUseCase } from '@/experiences/use-cases/remove-experience.use-case';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceType } from '@/experiences/types/experience.types';
import { NotFoundException } from '@nestjs/common';

describe('RemoveExperienceUseCase', () => {
  let useCase: RemoveExperienceUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let professionalRepository: jest.Mocked<ProfessionalExperiencesRepository>;
  let aisUnitsRepository: jest.Mocked<AisUnitsRepository>;

  const input = {
    userId: 'user-id',
    experienceId: 'experience-id',
    experienceType: ExperienceType.WORK,
  };

  beforeEach(() => {
    professionalRepository = {
      findByIdAndUserId: jest.fn(),
      deleteById: jest.fn(),
    } as unknown as jest.Mocked<ProfessionalExperiencesRepository>;

    experienceRepositoryFactory = {
      getRepository: jest.fn().mockReturnValue(professionalRepository),
    } as unknown as jest.Mocked<ExperienceRepositoryFactory>;

    aisUnitsRepository = {
      deleteByExperience: jest.fn(),
    } as unknown as jest.Mocked<AisUnitsRepository>;

    useCase = new RemoveExperienceUseCase(
      experienceRepositoryFactory,
      aisUnitsRepository,
    );
  });

  it('should remove experience and associated AIS units', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue({
      id: input.experienceId,
      userId: input.userId,
    } as any);

    await useCase.execute(input);

    expect(professionalRepository.findByIdAndUserId).toHaveBeenCalledWith(
      input.experienceId,
      input.userId,
    );
    expect(aisUnitsRepository.deleteByExperience).toHaveBeenCalledWith(
      input.experienceId,
      ExperienceType.WORK,
    );
    expect(professionalRepository.deleteById).toHaveBeenCalledWith(
      input.experienceId,
      input.userId,
    );
  });

  it('should throw NotFoundException when experience does not exist', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(professionalRepository.deleteById).not.toHaveBeenCalled();
  });
});
