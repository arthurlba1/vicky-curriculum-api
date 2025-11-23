import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { BaseAisUnit } from '@/experiences/dto/ais-unit/base-ais-unit';

export class CreateAisUnitInput extends BaseAisUnit {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  override action: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  override impact: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  override context: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  override skills: string[];
}
