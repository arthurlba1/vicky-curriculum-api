import { ApiProperty } from '@nestjs/swagger';

import { ExperienceType } from '@/experiences/types/experience.types';

export class ExperienceSummary {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ExperienceType })
  experienceType: ExperienceType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: Object })
  payload: Record<string, unknown>;
}
