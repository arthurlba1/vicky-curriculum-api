import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository } from 'typeorm';

import { ProfessionalExperience } from '@/experiences/entities/professional-experience.entity';

@Injectable()
export class ProfessionalExperiencesRepository extends Repository<ProfessionalExperience> {
  constructor(private readonly dataSource: DataSource) {
    super(ProfessionalExperience, dataSource.createEntityManager());
  }

  findByUserId(userId: string): Promise<ProfessionalExperience[]> {
    return this.find({
      where: { userId },
      order: { startDate: 'DESC' },
    });
  }

  findByIdAndUserId(id: string, userId: string): Promise<ProfessionalExperience | null> {
    return this.findOne({ where: { id, userId } });
  }

  async createExperience(
    payload: DeepPartial<ProfessionalExperience>,
    userId: string,
  ): Promise<ProfessionalExperience> {
    const entity = this.create({ ...payload, userId });
    const saved = await this.save(entity);
    return this.findOneOrFail({ where: { id: saved.id, userId } });
  }

  async updateExperience(
    id: string,
    userId: string,
    payload: DeepPartial<ProfessionalExperience>,
  ): Promise<ProfessionalExperience> {
    await this.update({ id, userId }, payload);
    return this.findOneOrFail({ where: { id, userId } });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.delete({ id, userId });
  }
}
