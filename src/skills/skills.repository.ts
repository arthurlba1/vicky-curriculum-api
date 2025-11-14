import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';

import { Skill } from '@/skills/skill.entity';

@Injectable()
export class SkillsRepository extends Repository<Skill> {
  constructor(private readonly dataSource: DataSource) {
    super(Skill, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Skill | null> {
    return this.findOne({ where: { name } });
  }

  async findByNames(names: string[]): Promise<Skill[]> {
    if (!names.length) return [];
    return this.find({ where: { name: In(names) } });
  }
}