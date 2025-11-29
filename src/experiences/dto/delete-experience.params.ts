import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

import { ExperienceType } from '@/experiences/types/experience.types';

export class DeleteExperienceParamsDto {
  @ApiProperty({ description: 'Experience ID' })
  @IsUUID()
  experienceId: string;

  @ApiProperty({ enum: ExperienceType, description: 'Type of experience' })
  @IsEnum(ExperienceType)
  experienceType: ExperienceType;
}
