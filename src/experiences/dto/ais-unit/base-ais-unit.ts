import { ApiProperty } from '@nestjs/swagger';

export class BaseAisUnit {
  @ApiProperty()
  action: string;

  @ApiProperty()
  impact: string;

  @ApiProperty()
  context: string;

  @ApiProperty({ type: [String] })
  skills: string[];
}
