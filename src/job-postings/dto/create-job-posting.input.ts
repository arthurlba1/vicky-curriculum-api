import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobPostingInput {
  @ApiProperty({
    description: 'Raw text content of the job posting',
    example: 'We are looking for a Senior Full Stack Developer...',
  })
  @IsNotEmpty()
  @IsString()
  rawText: string;
}
