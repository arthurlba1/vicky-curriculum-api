import { IsEnum, IsString, IsDate, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceCategory } from '@/experiences/experience.entity';

export class CreateExperienceDto {
  @IsEnum(ExperienceCategory)
  category: ExperienceCategory;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  subName?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @IsString()
  @IsOptional()
  location?: string;
}
