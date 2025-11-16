import { ApiProperty } from '@nestjs/swagger';
import { ExperienceWithAisUnitsResponseDto } from './experience-with-ais-units.response';

export class AllExperiencesResponseDto {
  @ApiProperty({
    description: 'Professional experiences with AIS units',
    type: [ExperienceWithAisUnitsResponseDto],
  })
  professional: ExperienceWithAisUnitsResponseDto[];

  @ApiProperty({
    description: 'Academic experiences with AIS units',
    type: [ExperienceWithAisUnitsResponseDto],
  })
  academic: ExperienceWithAisUnitsResponseDto[];

  @ApiProperty({
    description: 'Project experiences with AIS units',
    type: [ExperienceWithAisUnitsResponseDto],
  })
  project: ExperienceWithAisUnitsResponseDto[];
}
