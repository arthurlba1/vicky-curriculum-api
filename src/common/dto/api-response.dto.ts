import { ApiProperty } from "@nestjs/swagger";

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Response data' })
  data?: T;

  @ApiProperty({ type: String, description: 'Response message' })
  message: string;

  @ApiProperty({ type: Number, description: 'HTTP status code' })
  statusCode: number;
}
