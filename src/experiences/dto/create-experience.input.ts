import { ApiProperty } from '@nestjs/swagger';
import { Type, Expose } from 'class-transformer';
import { IsArray, IsEnum, ValidateNested, IsObject } from 'class-validator';

import { ExperienceType } from '@/experiences/types/experience.types';
import { CreateWorkExperienceInput } from '@/experiences/dto/create-work-experience.input';
import { CreateProjectExperienceInput } from '@/experiences/dto/create-project-experience.input';
import { CreateAcademicExperienceInput } from '@/experiences/dto/create-academic-experience.input';
import { CreateAisUnitInput } from '@/experiences/dto/ais-unit/create-ais-unit.input';

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
    description: 'Experience data based on experienceType',
  })
  @Expose()
  @IsObject({ message: 'Experience must be an object' })
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
