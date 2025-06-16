import { Expose } from 'class-transformer';

import { Experience } from '@/experiences/experience.entity';

@Expose()
export class ExperienceResponseDto {
  id: string;

  category: string;

  name: string;

  subName: string;

  startDate: Date;

  endDate: Date;

  isCurrent: boolean;

  location: string;

  createdAt: Date;

  updatedAt: Date;

  static fromEntity(entity: Experience): ExperienceResponseDto {
    return Object.assign(new ExperienceResponseDto(), entity);
  }

  static fromEntities(entities: Experience[]): ExperienceResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}
