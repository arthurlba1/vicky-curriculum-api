import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { CreateTopicDto } from '@/topics/dto/create-topic.dto';

export class UpdateTopicDto extends PartialType(CreateTopicDto) {
  @ApiProperty({ 
    description: 'The ID of the topic to update'
  })
  @IsString()
  id: string;
}
