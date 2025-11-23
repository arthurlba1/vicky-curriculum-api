import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateExperienceInput } from '@/experiences/dto/create-experience.input';
import { CreateAisUnitInput } from '@/experiences/dto/ais-unit/create-ais-unit.input';
import { UpdateAisUnitInput } from '@/experiences/dto/ais-unit/update-ais-unit.input';

/**
 * Union type for AIS units in update operations
 * Can be either a new unit (CreateAisUnitInput) or an existing unit to update (UpdateAisUnitInput)
 */
export type UpdateAisUnitInputUnion = CreateAisUnitInput | UpdateAisUnitInput;

/**
 * UpdateExperienceInput extends CreateExperienceInput but allows AIS units to be
 * either CreateAisUnitInput (for new units) or UpdateAisUnitInput (for existing units)
 */
export class UpdateExperienceInput extends OmitType(CreateExperienceInput, ['aisUnits'] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  experienceId: string;

  @ApiProperty({ 
    type: [Object], 
    required: false,
    description: 'AIS units to create (without id) or update (with id). Units not in this list will be deleted.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object) // Use Object to allow both CreateAisUnitInput and UpdateAisUnitInput
  aisUnits?: UpdateAisUnitInputUnion[];
}
