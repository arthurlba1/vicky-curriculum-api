import { UpdateAisUnitUseCase } from '@/experiences/use-cases/update-ais-unit.use-case';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceType } from '@/experiences/types/experience.types';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UpdateAisUnitUseCase', () => {
  let useCase: UpdateAisUnitUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let professionalRepository: jest.Mocked<ProfessionalExperiencesRepository>;
  let aisUnitsRepository: jest.Mocked<AisUnitsRepository>;

  const input = {
    userId: 'user-id',
    experienceType: ExperienceType.WORK,
    experienceId: 'experience-id',
    aisUnit: {
      id: 'ais-unit-id',
      action: 'Updated action',
      impact: 'Updated impact',
      context: 'Updated context',
      skills: ['skill1', 'skill2'],
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
      findById: jest.fn(),
      updateUnit: jest.fn(),
    } as unknown as jest.Mocked<AisUnitsRepository>;

    useCase = new UpdateAisUnitUseCase(
      experienceRepositoryFactory,
      aisUnitsRepository,
    );
  });

  it('should update AIS unit when experience and unit are valid', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue({
      id: input.experienceId,
      userId: input.userId,
    } as any);
    aisUnitsRepository.findById.mockResolvedValue({
      id: input.aisUnit.id,
      experienceId: input.experienceId,
      experienceType: ExperienceType.WORK,
    } as any);
    const updated = {
      id: input.aisUnit.id,
      experienceId: input.experienceId,
      experienceType: ExperienceType.WORK,
      ...input.aisUnit,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    aisUnitsRepository.updateUnit.mockResolvedValue(updated);

    const result = await useCase.execute(input);

    expect(professionalRepository.findByIdAndUserId).toHaveBeenCalledWith(
      input.experienceId,
      input.userId,
    );
    expect(aisUnitsRepository.findById).toHaveBeenCalledWith(input.aisUnit.id);
    expect(aisUnitsRepository.updateUnit).toHaveBeenCalledWith(
      input.aisUnit.id,
      expect.objectContaining({
        action: input.aisUnit.action,
      }),
    );
    expect(result.id).toBe(updated.id);
  });

  it('should throw NotFoundException when experience does not exist', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(aisUnitsRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when ais unit does not exist', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue({} as any);
    aisUnitsRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(aisUnitsRepository.updateUnit).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when ais unit belongs to another experience', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue({} as any);
    aisUnitsRepository.findById.mockResolvedValue({
      id: input.aisUnit.id,
      experienceId: 'other-experience',
      experienceType: ExperienceType.WORK,
    } as any);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ForbiddenException);
    expect(aisUnitsRepository.updateUnit).not.toHaveBeenCalled();
  });
});
