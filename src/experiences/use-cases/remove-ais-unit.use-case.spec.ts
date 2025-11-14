import { RemoveAisUnitUseCase } from '@/experiences/use-cases/remove-ais-unit.use-case';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceType } from '@/experiences/types/experience.types';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('RemoveAisUnitUseCase', () => {
  let useCase: RemoveAisUnitUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let professionalRepository: jest.Mocked<ProfessionalExperiencesRepository>;
  let aisUnitsRepository: jest.Mocked<AisUnitsRepository>;

  const input = {
    userId: 'user-id',
    experienceType: ExperienceType.WORK,
    experienceId: 'experience-id',
    aisUnitId: 'ais-unit-id',
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
      deleteById: jest.fn(),
    } as unknown as jest.Mocked<AisUnitsRepository>;

    useCase = new RemoveAisUnitUseCase(
      experienceRepositoryFactory,
      aisUnitsRepository,
    );
  });

  it('should remove AIS unit when valid', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue({
      id: input.experienceId,
      userId: input.userId,
    } as any);
    aisUnitsRepository.findById.mockResolvedValue({
      id: input.aisUnitId,
      experienceId: input.experienceId,
      experienceType: ExperienceType.WORK,
    } as any);

    await useCase.execute(input);

    expect(aisUnitsRepository.deleteById).toHaveBeenCalledWith(input.aisUnitId);
  });

  it('should throw NotFoundException when experience does not exist', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(aisUnitsRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when AIS unit missing', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue({} as any);
    aisUnitsRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(aisUnitsRepository.deleteById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when AIS unit belongs to another experience', async () => {
    professionalRepository.findByIdAndUserId.mockResolvedValue({} as any);
    aisUnitsRepository.findById.mockResolvedValue({
      id: input.aisUnitId,
      experienceId: 'other-experience',
      experienceType: ExperienceType.WORK,
    } as any);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ForbiddenException);
    expect(aisUnitsRepository.deleteById).not.toHaveBeenCalled();
  });
});
