import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CalculateMatchParamsDto {
  @ApiProperty({ description: 'Job posting ID' })
  @IsUUID()
  id: string;
}
