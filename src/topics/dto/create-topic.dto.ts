import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTopicDto {
  @ApiProperty({ 
    description: 'The category of the topic',
    example: 'Backend'
  })
  @IsString()
  category: string;

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
