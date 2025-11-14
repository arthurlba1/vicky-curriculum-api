import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';

import { ExperienceType } from '@/experiences/types/experience.types';
import { CreateWorkExperienceInput } from '@/experiences/dto/create-work-experience.input';
import { CreateProjectExperienceInput } from '@/experiences/dto/create-project-experience.input';
import { CreateAcademicExperienceInput } from '@/experiences/dto/create-academic-experience.input';
import { CreateAisUnitInput } from '@/experiences/dto/create-ais-unit.input';

export class CreateExperienceInput {
  @ApiProperty({ enum: ExperienceType })
  @IsEnum(ExperienceType)
  experienceType: ExperienceType;

  @ApiProperty({
    oneOf: [
      { $ref: '#/components/schemas/CreateWorkExperienceInput' },
      { $ref: '#/components/schemas/CreateProjectExperienceInput' },
      { $ref: '#/components/schemas/CreateAcademicExperienceInput' },
    ],
  })
  @ValidateNested()
  @Type(() => Object)
  experience:
    | CreateWorkExperienceInput
    | CreateProjectExperienceInput
    | CreateAcademicExperienceInput;

  @ApiProperty({ type: [CreateAisUnitInput], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAisUnitInput)
  aisUnits: CreateAisUnitInput[] = [];
}
