import { ExperienceRepositoryFactory } from '@/experiences/experience-repository.factory';
import { AisUnitsRepository } from '@/experiences/repositories/ais-units.repository';
import { ListAllExperiencesUseCase } from '@/experiences/use-cases/list-all-experiences.use-case';
import { ExperienceType } from '@/experiences/types/experience.types';
import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';
import { ProjectExperience } from '@/experiences/entities/project-experience.entity';
import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';
import { AisUnit } from '@/experiences/entities/ais-unit.entity';

describe('ListAllExperiencesUseCase', () => {
  let useCase: ListAllExperiencesUseCase;
  let experienceRepositoryFactory: jest.Mocked<ExperienceRepositoryFactory>;
  let aisUnitsRepository: jest.Mocked<AisUnitsRepository>;
  let professionalRepo: jest.Mocked<any>;
  let projectRepo: jest.Mocked<any>;
  let academicRepo: jest.Mocked<any>;

  const userId = 'user-123';

  beforeEach(() => {
    professionalRepo = {
      findByUserId: jest.fn(),
    };
    projectRepo = {
      findByUserId: jest.fn(),
    };
    academicRepo = {
      findByUserId: jest.fn(),
    };

    experienceRepositoryFactory = {
      getRepository: jest.fn((type: ExperienceType) => {
        if (type === ExperienceType.WORK) return professionalRepo;
        if (type === ExperienceType.PROJECT) return projectRepo;
        if (type === ExperienceType.EDUCATION) return academicRepo;
        throw new Error('Unknown experience type');
      }),
    } as unknown as jest.Mocked<ExperienceRepositoryFactory>;

    aisUnitsRepository = {
      findByExperience: jest.fn(),
    } as unknown as jest.Mocked<AisUnitsRepository>;

    useCase = new ListAllExperiencesUseCase(experienceRepositoryFactory, aisUnitsRepository);
  });

  it('should return all experiences separated by type with AIS units', async () => {
    const professionalExp = {
      id: 'prof-1',
      userId,
      companyName: 'Company A',
      role: 'Developer',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ProfessionalExperience;

    const projectExp = {
      id: 'proj-1',
      userId,
      projectName: 'Project A',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ProjectExperience;

    const academicExp = {
      id: 'acad-1',
      userId,
      institution: 'University A',
      course: 'CS',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AcademicExperience;

    const aisUnit = {
      id: 'ais-1',
      experienceId: 'prof-1',
      experienceType: ExperienceType.WORK,
      action: 'Action',
      impact: 'Impact',
      context: 'Context',
      skills: ['skill1'],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AisUnit;

    professionalRepo.findByUserId.mockResolvedValue([professionalExp]);
    projectRepo.findByUserId.mockResolvedValue([projectExp]);
    academicRepo.findByUserId.mockResolvedValue([academicExp]);
    
    aisUnitsRepository.findByExperience.mockImplementation((experienceId: string, experienceType: ExperienceType) => {
      if (experienceId === 'prof-1' && experienceType === ExperienceType.WORK) {
        return Promise.resolve([aisUnit]);
      }
      return Promise.resolve([]);
    });

    const result = await useCase.execute({ userId });

    expect(result.professional).toHaveLength(1);
    expect(result.project).toHaveLength(1);
    expect(result.academic).toHaveLength(1);
    expect(result.professional[0].aisUnits).toHaveLength(1);
    expect(result.project[0].aisUnits).toHaveLength(0);
    expect(result.academic[0].aisUnits).toHaveLength(0);
  });

  it('should return empty arrays when user has no experiences', async () => {
    professionalRepo.findByUserId.mockResolvedValue([]);
    projectRepo.findByUserId.mockResolvedValue([]);
    academicRepo.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute({ userId });

    expect(result.professional).toEqual([]);
    expect(result.project).toEqual([]);
    expect(result.academic).toEqual([]);
  });
});
