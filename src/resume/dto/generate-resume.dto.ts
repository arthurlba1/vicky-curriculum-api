import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GenerateResumeDto {
  @ApiProperty({ description: 'The job description to generate a resume from' })
  @IsString()
  jobDescription: string;
}
