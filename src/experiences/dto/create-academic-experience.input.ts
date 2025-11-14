import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { BaseExperienceInput } from '@/experiences/dto/base-experience.input';

export class CreateAcademicExperienceInput extends BaseExperienceInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  institution: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  course: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
