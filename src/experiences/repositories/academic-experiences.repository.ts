import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository } from 'typeorm';

import { AcademicExperience } from '@/experiences/entities/academic-experience.entity';

@Injectable()
export class AcademicExperiencesRepository extends Repository<AcademicExperience> {
  constructor(private readonly dataSource: DataSource) {
    super(AcademicExperience, dataSource.createEntityManager());
  }

  findByUserId(userId: string): Promise<AcademicExperience[]> {
    return this.find({
      where: { userId },
      order: { startDate: 'DESC' },
    });
  }

  findByIdAndUserId(id: string, userId: string): Promise<AcademicExperience | null> {
    return this.findOne({ where: { id, userId } });
  }

  async createExperience(
    payload: DeepPartial<AcademicExperience>,
    userId: string,
  ): Promise<AcademicExperience> {
    const entity = this.create({ ...payload, userId });
    const saved = await this.save(entity);
    return this.findOneOrFail({ where: { id: saved.id, userId } });
  }

  async updateExperience(
    id: string,
    userId: string,
    payload: DeepPartial<AcademicExperience>,
  ): Promise<AcademicExperience> {
    await this.update({ id, userId }, payload);
    return this.findOneOrFail({ where: { id, userId } });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.delete({ id, userId });
  }
}
