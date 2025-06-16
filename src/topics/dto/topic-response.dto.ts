import { Exclude, Expose } from 'class-transformer';

import { Topic } from '@/topics/entities/topic.entity';

@Exclude()
export class TopicResponseDto {
  @Expose()
  id: string;

  @Expose()
  category: string;

  @Expose()
  description: string;

  @Expose()
  experience_id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Topic): TopicResponseDto {
    return Object.assign(new TopicResponseDto(), entity);
  }

  static fromEntities(entities: Topic[]): TopicResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
} 