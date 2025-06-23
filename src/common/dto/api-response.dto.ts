import { ApiProperty } from "@nestjs/swagger";

export class ApiResponseDto<T> {
  @ApiProperty({ type: Object })
  data?: T;

  @ApiProperty({ type: String })
  message: string;

  @ApiProperty({ type: Number })
  statusCode: number;
}
