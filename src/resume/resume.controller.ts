import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ResumeService } from '@/resume/resume.service';
import { ApiGenerateResumeDocumentation } from '@/resume/decorators/resume-swagger.decorator';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { GenerateResumeDto } from './dto/generate-resume.dto';
import { STATUS_CODES } from '@/common/types/status';

@ApiTags('resume')
@ApiBearerAuth('JWT')
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}


  @Post('generate')
  @ApiGenerateResumeDocumentation()
  async generateResume(
    @Body() generateResumeDto: GenerateResumeDto,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    await this.resumeService.generateResume(generateResumeDto, res);
  }
}
