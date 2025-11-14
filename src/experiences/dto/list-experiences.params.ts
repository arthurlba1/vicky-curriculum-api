import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ExperienceType } from '@/experiences/types/experience.types';

export class ListExperiencesParamsDto {
  @ApiProperty({ enum: ExperienceType })
  @IsEnum(ExperienceType)
  experienceType: ExperienceType;
}
