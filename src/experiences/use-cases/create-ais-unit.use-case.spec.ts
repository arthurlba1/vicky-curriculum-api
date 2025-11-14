import { CreateAisUnitUseCase } from '@/experiences/use-cases/create-ais-unit.use-case';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceType } from '@/experiences/types/experience.types';
import { NotFoundException } from '@nestjs/common';

describe('CreateAisUnitUseCase', () => {
  let useCase: CreateAisUnitUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let professionalRepository: jest.Mocked<ProfessionalExperiencesRepository>;
  let aisUnitsRepository: jest.Mocked<AisUnitsRepository>;

  const input = {
    userId: 'user-id',
    experienceType: ExperienceType.WORK,
    experienceId: 'experience-id',
    aisUnit: {
      action: 'Implemented feature',
      impact: 'Improved conversion',
      context: 'Product team initiative',
      skills: ['node', 'typescript'],
    },
  };

  beforeEach(() => {
    professionalRepository = {
      findByIdAndUserId: jest.fn(),
    } as unknown as jest.Mocked<ProfessionalExperiencesRepository>;

    experienceRepositoryFactory = {
      getRepository: jest.fn().mockReturnValue(professionalRepository),
    } as unknown as jest.Mocked<ExperienceRepositoryFactory>;

    aisUnitsRepository = {
      createUnit: jest.fn(),
    } as unknown as jest.Mocked<AisUnitsRepository>;

    useCase = new CreateAisUnitUseCase(
      experienceRepositoryFactory,
      aisUnitsRepository,
    );
  });

  it('should create AIS unit when experience exists', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue({
      id: input.experienceId,
      userId: input.userId,
    } as any);
    const aisUnit = {
      id: 'ais-unit-id',
      ...input.aisUnit,
      experienceId: input.experienceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    aisUnitsRepository.createUnit.mockResolvedValue(aisUnit);

    const result = await useCase.execute(input);

    expect(professionalRepository.findByIdAndUserId).toHaveBeenCalledWith(
      input.experienceId,
      input.userId,
    );
    expect(aisUnitsRepository.createUnit).toHaveBeenCalledWith(
      expect.objectContaining({
        experienceId: input.experienceId,
        experienceType: ExperienceType.WORK,
      }),
    );
    expect(result.id).toBe(aisUnit.id);
  });

  it('should throw NotFoundException when experience does not exist', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(aisUnitsRepository.createUnit).not.toHaveBeenCalled();
  });
});
