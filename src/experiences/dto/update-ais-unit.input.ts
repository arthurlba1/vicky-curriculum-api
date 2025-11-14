import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { CreateAisUnitInput } from '@/experiences/dto/create-ais-unit.input';

export class UpdateAisUnitInput extends CreateAisUnitInput {
  @ApiProperty()
  @IsUUID()
  id: string;
}
