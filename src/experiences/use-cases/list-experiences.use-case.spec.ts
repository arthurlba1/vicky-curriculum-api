import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { ProfessionalExperiencesRepository } from '@/experiences/repositories/professional-experiences.repository';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ListExperiencesUseCase } from '@/experiences/use-cases/list-experiences.use-case';

describe('ListExperiencesUseCase', () => {
  let useCase: ListExperiencesUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let professionalRepository: jest.Mocked<ProfessionalExperiencesRepository>;

  const input = {
    userId: 'user-id',
    experienceType: ExperienceType.WORK,
  };

  beforeEach(() => {
    professionalRepository = {
      findByUserId: jest.fn(),
    } as unknown as jest.Mocked<ProfessionalExperiencesRepository>;

    experienceRepositoryFactory = {
      getRepository: jest.fn().mockReturnValue(professionalRepository),
    } as unknown as jest.Mocked<ExperienceRepositoryFactory>;

    useCase = new ListExperiencesUseCase(experienceRepositoryFactory);
  });

  it('should list experiences for user and type', async () => {
    professionalRepository.findByUserId.mockResolvedValue([
      { id: 'exp-1', userId: input.userId, createdAt: new Date(), updatedAt: new Date() } as any,
    ]);

    const result = await useCase.execute(input);

    expect(experienceRepositoryFactory.getRepository).toHaveBeenCalledWith(
      ExperienceType.WORK,
    );
    expect(professionalRepository.findByUserId).toHaveBeenCalledWith(input.userId);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'exp-1',
      experienceType: ExperienceType.WORK,
    });
  });
});
