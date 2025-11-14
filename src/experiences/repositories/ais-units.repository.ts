import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository } from 'typeorm';

import { ExperienceType } from '@/experiences/types/experience.types';
import { AisUnit } from '@/experiences/entities/ais-unit.entity';

@Injectable()
export class AisUnitsRepository extends Repository<AisUnit> {
  constructor(private readonly dataSource: DataSource) {
    super(AisUnit, dataSource.createEntityManager());
  }

  findByExperience(experienceId: string, experienceType: ExperienceType): Promise<AisUnit[]> {
    return this.find({
      where: { experienceId, experienceType },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<AisUnit | null> {
    return this.findOne({ where: { id } });
  }

  async createUnit(payload: DeepPartial<AisUnit>): Promise<AisUnit> {
    const unit = this.create(payload);
    return this.save(unit);
  }

  async updateUnit(id: string, payload: DeepPartial<AisUnit>): Promise<AisUnit> {
    await this.update(id, payload);
    return this.findOneOrFail({ where: { id } });
  }

  async deleteById(id: string): Promise<void> {
    await this.delete(id);
  }

  async deleteByExperience(experienceId: string, experienceType: ExperienceType): Promise<void> {
    await this.delete({ experienceId, experienceType });
  }
}
