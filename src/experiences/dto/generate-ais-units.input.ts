import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateAisUnitsInput {
  @ApiProperty({
    description: 'Raw experience description to be processed and converted into AIS units',
    example: 'Worked as a senior developer at XYZ Corp. Led a team of 5 developers to build a new microservices architecture using Node.js and Docker. Reduced deployment time by 60% and improved system reliability.',
  })
  @IsString()
  @IsNotEmpty()
  rawExperienceDescription: string;
}
