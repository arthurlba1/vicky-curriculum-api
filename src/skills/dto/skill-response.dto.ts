import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance } from 'class-transformer';

import { Skill } from '@/skills/skill.entity';

@Exclude()
export class SkillResponseDto {
  @ApiProperty({ description: 'Skill identifier' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Skill name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Skill category', required: false })
  @Expose()
  category?: string;

  @ApiProperty({ description: 'Global weight', required: false })
  @Expose()
  globalWeight?: number;

  static fromEntity(entity: Skill): SkillResponseDto {
    return plainToInstance(SkillResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: Skill[]): SkillResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

