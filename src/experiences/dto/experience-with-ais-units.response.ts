import { ApiProperty } from '@nestjs/swagger';

import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import { AisUnitResponse } from '@/experiences/dto/ais-unit.response';

export class ExperienceWithAisUnitsResponseDto {
  @ApiProperty()
  experience: ExperienceSummary;

  @ApiProperty({ type: () => [AisUnitResponse] })
  aisUnits: AisUnitResponse[];

  @ApiProperty({ type: [String], description: 'Unique skills aggregated from AIS units' })
  skills: string[];
}
