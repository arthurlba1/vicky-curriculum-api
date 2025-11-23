import { ApiProperty } from '@nestjs/swagger';
import { ExperienceType } from '@/experiences/types/experience.types';

import { BaseAisUnit } from './base-ais-unit';

export class AisUnitResponse extends BaseAisUnit {
  @ApiProperty()
  id: string;

  @ApiProperty()
  experienceId: string;

  @ApiProperty({ enum: ExperienceType })
  experienceType: ExperienceType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
