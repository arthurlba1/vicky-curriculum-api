import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Skill } from '@/skills/skill.entity';
import { SkillsRepository } from '@/skills/skills.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Skill])],
  providers: [SkillsRepository],
  exports: [SkillsRepository],
})
export class SkillsModule {}

