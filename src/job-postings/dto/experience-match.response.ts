import { ApiProperty } from '@nestjs/swagger';
import { ExperienceType } from '@/experiences/types/experience.types';

export class ExperienceMatchResponse {
  @ApiProperty()
  experienceId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ExperienceType })
  experienceType: ExperienceType;

  @ApiProperty({ description: 'Match score from 0 to 100' })
  matchScore: number;

  @ApiProperty({ type: Object })
  experience: Record<string, unknown>;

  @ApiProperty({ type: [String], description: 'Compatible skills from AIS units' })
  compatibleSkills: string[];
}
