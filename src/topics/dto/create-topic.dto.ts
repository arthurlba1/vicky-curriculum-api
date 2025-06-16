import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';

import { TopicCategories } from '@/topics/topics.types';


export class CreateTopicDto {
  @IsEnum(TopicCategories)
  category: TopicCategories;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()

  @IsUUID()
  experience_id: string;
} 