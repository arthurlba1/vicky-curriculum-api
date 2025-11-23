import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsArray } from 'class-validator';

import { BaseAisUnit } from '@/experiences/dto/ais-unit/base-ais-unit';

export class UpdateAisUnitInput extends PartialType(BaseAisUnit) {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  override action?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  override impact?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  override context?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  override skills?: string[];
}
