import { CreateExperienceUseCase } from '@/experiences/use-cases/create-experience.use-case';
import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';

describe('CreateExperienceUseCase', () => {
  let useCase: CreateExperienceUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let professionalRepository: jest.Mocked<ProfessionalExperiencesRepository>;
  let aisUnitsRepository: jest.Mocked<AisUnitsRepository>;

  const input = {
    userId: 'user-id',
    experienceType: ExperienceType.WORK,
    experience: {
      companyName: 'Company',
      role: 'Developer',
      location: 'Remote',
      startDate: '2020-01-01',
      endDate: '2021-01-01',
      generalDescription: 'Worked on projects',
    },
    aisUnits: [
      {
        action: 'Implemented feature X',
        impact: 'Increased performance by 20%',
        context: 'Team project',
        skills: ['typescript', 'node'],
      },
    ],
  };

  beforeEach(() => {
    professionalRepository = {
      createExperience: jest.fn(),
    } as unknown as jest.Mocked<ProfessionalExperiencesRepository>;

    experienceRepositoryFactory = {
      getRepository: jest.fn().mockReturnValue(professionalRepository),
    } as unknown as jest.Mocked<ExperienceRepositoryFactory>;

    aisUnitsRepository = {
      createUnit: jest.fn(),
    } as unknown as jest.Mocked<AisUnitsRepository>;

    useCase = new CreateExperienceUseCase(experienceRepositoryFactory, aisUnitsRepository);
  });

  it('should create experience and related AIS units', async () => {
    const experience = { id: 'experience-id', userId: input.userId, createdAt: new Date(), updatedAt: new Date() } as any;
    const aisUnit = { id: 'ais-unit-id', ...input.aisUnits[0], createdAt: new Date(), updatedAt: new Date(), experienceId: experience.id } as any;

    professionalRepository.createExperience.mockResolvedValue(experience);
    aisUnitsRepository.createUnit.mockResolvedValue(aisUnit);

    const result = await useCase.execute(input);

    expect(experienceRepositoryFactory.getRepository).toHaveBeenCalledWith(ExperienceType.WORK);
    expect(professionalRepository.createExperience).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: input.experience.companyName,
        role: input.experience.role,
      }),
      input.userId,
    );
    expect(aisUnitsRepository.createUnit).toHaveBeenCalledWith(
      expect.objectContaining({
        experienceId: experience.id,
        experienceType: ExperienceType.WORK,
      }),
    );
    expect(result.experience.id).toBe(experience.id);
    expect(result.aisUnits).toHaveLength(1);
    expect(result.aisUnits[0].id).toBe(aisUnit.id);
  });
});
