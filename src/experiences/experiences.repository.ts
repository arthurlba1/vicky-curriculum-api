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
    });
  }

  async findById(id: string): Promise<Experience | null> {
    return this.findOne({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Experience | null> {
    return this.findOne({
      where: { id, userId: userId },
    });
  }

  async createExperience(createExperienceDto: CreateExperienceDto): Promise<Experience> {
    const experience = this.create(createExperienceDto);
    return this.save(experience);
  }

  async updateExperience(id: string, updateExperienceDto: UpdateExperienceDto): Promise<Experience> {
    await this.update(id, updateExperienceDto);
    return this.findById(id);
  }

  async deleteExperience(id: string): Promise<void> {
    await this.delete(id);
  }
} 