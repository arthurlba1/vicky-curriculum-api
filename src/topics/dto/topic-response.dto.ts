import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Topic } from '@/topics/topic.entity';
import { TopicCategories } from '@/topics/topics.types';

@Exclude()
export class TopicResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ enum: TopicCategories })
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  experience_id: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Topic): TopicResponseDto {
    return Object.assign(new TopicResponseDto(), entity);
  }

  static fromEntities(entities: Topic[]): TopicResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}
