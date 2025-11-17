import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { CreateJobPostingInput } from './dto/create-job-posting.input';
import { JobPostingResponse } from './dto/job-posting.response';
import { CreateJobPostingUseCase } from './use-cases/create-job-posting.use-case';
import { JobPostingsRepository } from './repositories/job-postings.repository';

@ApiTags('job-postings')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(ApiResponseDto, JobPostingResponse, CreateJobPostingInput)
@Controller('job-postings')
export class JobPostingsController {
  constructor(
    private readonly createJobPostingUseCase: CreateJobPostingUseCase,
    private readonly jobPostingsRepository: JobPostingsRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({
    status: 201,
    description: 'Job posting created successfully',
    type: ApiResponseDto,
  })
  async createJobPosting(
    @CurrentUser() user: UserResponseDto,
    @Body() body: CreateJobPostingInput,
  ): Promise<ApiResponseDto<JobPostingResponse>> {
    const result = await this.createJobPostingUseCase.execute({
      ...body,
      userId: user.id,
    });

    return {
      data: result,
      message: 'Job posting created successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.CREATED,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all job postings for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Job postings retrieved successfully',
    type: ApiResponseDto,
  })
  async listJobPostings(
    @CurrentUser() user: UserResponseDto,
  ): Promise<ApiResponseDto<JobPostingResponse[]>> {
    const jobPostings = await this.jobPostingsRepository.findByUserId(user.id);

    const data: JobPostingResponse[] = jobPostings.map((jp) => ({
      id: jp.id,
      userId: jp.userId,
      rawText: jp.rawText,
      status: jp.status,
      summaryJson: jp.summaryJson,
      createdAt: jp.createdAt,
      updatedAt: jp.updatedAt,
    }));

    return {
      data,
      message: 'Job postings retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }
}
