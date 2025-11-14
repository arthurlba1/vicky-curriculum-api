import { ApiProperty } from '@nestjs/swagger';

export class AisUnitResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  experienceId: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  impact: string;

  @ApiProperty()
  context: string;

  @ApiProperty({ type: [String] })
  skills: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
