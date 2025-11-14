import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateExperienceInput } from '@/experiences/dto/create-experience.input';

export class UpdateExperienceInput extends CreateExperienceInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  experienceId: string;
}
