import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';

import { TopicCategories } from '@/topics/topics.types';

export class CreateTopicDto {
  @ApiProperty({ 
    enum: TopicCategories,
    description: 'The category of the topic'
  })
  @IsEnum(TopicCategories)
  category: TopicCategories;

  @ApiProperty({ 
    description: 'The description of the topic',
    minLength: 10
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ 
    description: 'The ID of the experience this topic belongs to'
  })
  @IsString()
  @IsUUID()
  experienceId: string;
} 