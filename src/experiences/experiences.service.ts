import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';

import { CreateExperienceDto, CreateExperiencesDto } from '@/experiences/dto/create-experience.dto';
import { UpdateExperienceDto } from '@/experiences/dto/update-experience.dto';
import { ExperienceResponseDto } from '@/experiences/dto/experience-response.dto';
import { ExperiencesRepository } from '@/experiences/experiences.repository';
import { TopicsService } from '@/topics/topics.service';
import { CreateTopicDto } from '@/topics/dto/create-topic.dto';

@Injectable()
export class ExperiencesService {
  constructor(
    private readonly experiencesRepository: ExperiencesRepository,
    @Inject(forwardRef(() => TopicsService))
    private readonly topicsService: TopicsService,
  ) {}

  async create(userId: string, createExperienceDto: CreateExperienceDto): Promise<void> {
    const experience = await this.experiencesRepository.createExperience(createExperienceDto, userId);

    await this.createTopicsForSkills(userId, experience.id, createExperienceDto.skills, createExperienceDto.skillsDescription);
  }

  async createBatch(userId: string, createExperiencesDto: CreateExperiencesDto): Promise<void> {
    for (const experienceDto of createExperiencesDto.experiences) {
      const experience = await this.experiencesRepository.createExperience(experienceDto, userId);

      await this.createTopicsForSkills(userId, experience.id, experienceDto.skills, experienceDto.skillsDescription);
    }
  }

  async findAll(userId: string): Promise<ExperienceResponseDto[]> {
    const experiences = await this.experiencesRepository.findByUserId(userId);

    return experiences.map(experience => ExperienceResponseDto.fromEntity(experience));
  }

  async findOne(userId: string, id: string): Promise<ExperienceResponseDto> {
    const experience = await this.experiencesRepository.findByIdAndUserId(id, userId);
    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    return ExperienceResponseDto.fromEntity(experience);
  }

  async update(
    userId: string,
    id: string,
    updateExperienceDto: UpdateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    const experience = await this.experiencesRepository.findByIdAndUserId(id, userId);
    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }
    const updatedExperience = await this.experiencesRepository.updateExperience(id, updateExperienceDto);

    return ExperienceResponseDto.fromEntity(updatedExperience);
  }

  async remove(userId: string, id: string): Promise<void> {
    const experience = await this.experiencesRepository.findByIdAndUserId(id, userId);
    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }
    await this.experiencesRepository.deleteExperience(id);
  }

  private async createTopicsForSkills(
    userId: string,
    experienceId: string,
    skills: string[],
    skillsDescription: Record<string, string>
  ): Promise<void> {
    for (const skill of skills) {
      const description = skillsDescription[skill] || `Experience with ${skill}`;

      const createTopicDto: CreateTopicDto = {
        category: skill,
        description,
        experienceId,
      };

      await this.topicsService.create(userId, createTopicDto);
    }
  }
}
