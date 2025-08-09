import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Experience } from '@/experiences/experience.entity';
import { TopicResponseDto } from '@/topics/dto/topic-response.dto';

@Expose()
export class ExperienceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  subName: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  isCurrent: boolean;

  @ApiProperty()
  location: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [TopicResponseDto] })
  @Expose()
  @Type(() => TopicResponseDto)
  topics: TopicResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: Experience): ExperienceResponseDto {
    return Object.assign(new ExperienceResponseDto(), entity);
  }

  static fromEntities(entities: Experience[]): ExperienceResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}
