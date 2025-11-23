import { ApiProperty } from '@nestjs/swagger';

export class GeneratedAisUnitDto {
  @ApiProperty({ description: 'The specific action or task performed' })
  action: string;

  @ApiProperty({ description: 'The measurable impact or result achieved' })
  impact: string;

  @ApiProperty({ description: 'The context or situation in which the action was performed' })
  context: string;

  @ApiProperty({ type: [String], description: 'List of skills demonstrated or utilized' })
  skills: string[];
}

export class GenerateAisUnitsResponse {
  @ApiProperty({ type: [GeneratedAisUnitDto], description: 'Array of generated AIS units' })
  aisUnits: GeneratedAisUnitDto[];
}
