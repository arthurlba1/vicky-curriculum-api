import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { BaseExperienceInput } from '@/experiences/dto/base-experience.input';

export class CreateProjectExperienceInput extends BaseExperienceInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  repoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
