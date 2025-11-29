import { ApiProperty } from '@nestjs/swagger';

import { ExperienceSummary } from './experience-summary.dto';

export class ExperienceSummaryWithSkills extends ExperienceSummary {
  @ApiProperty({ 
    type: [String],
    description: 'Unique skills aggregated from all AIS units of this experience',
    example: ['Node.js', 'TypeScript', 'Docker', 'Kubernetes'],
  })
  skills: string[];
}
