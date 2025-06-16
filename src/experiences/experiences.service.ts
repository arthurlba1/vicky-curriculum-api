import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateExperienceDto } from '@/experiences/dto/create-experience.dto';
import { UpdateExperienceDto } from '@/experiences/dto/update-experience.dto';
import { ExperienceResponseDto } from '@/experiences/dto/experience-response.dto';
import { ExperiencesRepository } from '@/experiences/experiences.repository';

@Injectable()
export class ExperiencesService {
  constructor(
    private readonly experiencesRepository: ExperiencesRepository,
  ) {}

  async create(userId: string, createExperienceDto: CreateExperienceDto): Promise<ExperienceResponseDto> {
    const experience = await this.experiencesRepository.createExperience({
      ...createExperienceDto,
      userId,
    });

    return ExperienceResponseDto.fromEntity(experience);
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
} 