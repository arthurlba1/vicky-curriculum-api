import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

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
}
