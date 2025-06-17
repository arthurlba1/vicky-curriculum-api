import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsDate, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

import { ExperienceCategory } from '@/experiences/experiences.types';

export class CreateExperienceDto {
  @ApiProperty({ enum: ExperienceCategory })
  @IsEnum(ExperienceCategory)
  category: ExperienceCategory;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subName?: string;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  userId: string;
}
