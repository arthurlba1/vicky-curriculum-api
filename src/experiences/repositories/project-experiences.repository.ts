import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository } from 'typeorm';

import { ProjectExperience } from '@/experiences/entities/project-experience.entity';

@Injectable()
export class ProjectExperiencesRepository extends Repository<ProjectExperience> {
  constructor(private readonly dataSource: DataSource) {
    super(ProjectExperience, dataSource.createEntityManager());
  }

  findByUserId(userId: string): Promise<ProjectExperience[]> {
    return this.find({
      where: { userId },
      order: { startDate: 'DESC' },
    });
  }

  findByIdAndUserId(id: string, userId: string): Promise<ProjectExperience | null> {
    return this.findOne({ where: { id, userId } });
  }

  async createExperience(
    payload: DeepPartial<ProjectExperience>,
    userId: string,
  ): Promise<ProjectExperience> {
    const entity = this.create({ ...payload, userId });
    const saved = await this.save(entity);
    return this.findOneOrFail({ where: { id: saved.id, userId } });
  }

  async updateExperience(
    id: string,
    userId: string,
    payload: DeepPartial<ProjectExperience>,
  ): Promise<ProjectExperience> {
    await this.update({ id, userId }, payload);
    return this.findOneOrFail({ where: { id, userId } });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.delete({ id, userId });
  }
}
