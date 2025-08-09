import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Experience } from '@/experiences/experience.entity';
import { CreateExperienceDto } from '@/experiences/dto/create-experience.dto';
import { UpdateExperienceDto } from '@/experiences/dto/update-experience.dto';

@Injectable()
export class ExperiencesRepository extends Repository<Experience> {
  constructor(private dataSource: DataSource) {
    super(Experience, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<Experience[]> {
    return this.find({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
      relations: ['topics'],
    });
  }

  async findById(id: string): Promise<Experience | null> {
    return this.findOne({
      where: { id },
      relations: ['topics'],
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Experience | null> {
    return this.findOne({
      where: { id, userId: userId },
      relations: ['topics'],
    });
  }

  async createExperience(createExperienceDto: CreateExperienceDto, userId: string): Promise<Experience> {
    const experience = this.create({ ...createExperienceDto, userId });
    const savedExperience = await this.save(experience);
    return this.findById(savedExperience.id);
  }

  async updateExperience(id: string, updateExperienceDto: UpdateExperienceDto): Promise<Experience> {
    await this.update(id, updateExperienceDto);
    return this.findById(id);
  }

  async deleteExperience(id: string): Promise<void> {
    await this.delete(id);
  }
} 