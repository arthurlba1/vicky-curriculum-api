import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { BaseExperienceInput } from '@/experiences/dto/base-experience.input';

export class CreateWorkExperienceInput extends BaseExperienceInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  generalDescription?: string;
}
