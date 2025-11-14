import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateAisUnitInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  impact: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  context: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];
}
