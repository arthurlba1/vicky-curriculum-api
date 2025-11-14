import { applyDecorators } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

export function ApiGenerateResumeDocumentation() {
  return applyDecorators(
    ApiOperation({ summary: 'Generate a resume based on a job description' }),
  )
}
