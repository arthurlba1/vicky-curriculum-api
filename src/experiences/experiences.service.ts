import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from './entities/experience.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { ExperienceResponseDto } from './dto/experience-response.dto';

@Injectable()
export class ExperiencesService {
  constructor(
    @InjectRepository(Experience)
    private experiencesRepository: Repository<Experience>,
  ) {}

  async create(userId: string, createExperienceDto: CreateExperienceDto): Promise<ExperienceResponseDto> {
    const experience = this.experiencesRepository.create({
      ...createExperienceDto,
      user_id: userId,
    });

    const savedExperience = await this.experiencesRepository.save(experience);
    return ExperienceResponseDto.fromEntity(savedExperience);
  }

  async findAll(userId: string): Promise<ExperienceResponseDto[]> {
    const experiences = await this.experiencesRepository.find({
      where: { user_id: userId },
      order: { startDate: 'DESC' },
    });
    return ExperienceResponseDto.fromEntities(experiences);
  }

  async findOne(userId: string, id: string): Promise<ExperienceResponseDto> {
    const experience = await this.experiencesRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    return ExperienceResponseDto.fromEntity(experience);
  }

  async update(userId: string, id: string, updateExperienceDto: UpdateExperienceDto): Promise<ExperienceResponseDto> {
    const experience = await this.experiencesRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }

    const updatedExperience = await this.experiencesRepository.save({
      ...experience,
      ...updateExperienceDto,
    });

    return ExperienceResponseDto.fromEntity(updatedExperience);
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.experiencesRepository.delete({ id, user_id: userId });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }
  }
} 