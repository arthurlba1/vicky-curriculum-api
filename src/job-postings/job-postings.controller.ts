import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
import { FindJobPostingByIdUseCase } from './use-cases/find-job-posting-by-id.use-case';
import { JobPostingsRepository } from './repositories/job-postings.repository';
import { CalculateExperienceMatchUseCase } from '@/job-postings/use-cases/calculate-experience-match.use-case';
import { ExperienceMatchResponse } from '@/job-postings/dto/experience-match.response';
import { CalculateMatchParamsDto } from '@/job-postings/dto/calculate-match.params';

@ApiTags('job-postings')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(
  ApiResponseDto,
  JobPostingResponse,
  CreateJobPostingInput,
  ExperienceMatchResponse,
)
@Controller('job-postings')
export class JobPostingsController {
  constructor(
    private readonly createJobPostingUseCase: CreateJobPostingUseCase,
    private readonly findJobPostingByIdUseCase: FindJobPostingByIdUseCase,
    private readonly jobPostingsRepository: JobPostingsRepository,
    private readonly calculateExperienceMatchUseCase: CalculateExperienceMatchUseCase,
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

  @Get(':id/match')
  @ApiOperation({ summary: 'Calculate experience match scores for a job posting' })
  @ApiResponse({
    status: 200,
    description: 'Experience matches calculated successfully',
    type: ApiResponseDto,
  })
  async calculateExperienceMatch(
    @CurrentUser() user: UserResponseDto,
    @Param() params: CalculateMatchParamsDto,
    @Query('topK') topK?: number,
  ): Promise<ApiResponseDto<ExperienceMatchResponse[]>> {
    const result = await this.calculateExperienceMatchUseCase.execute({
      jobPostingId: params.id,
      userId: user.id,
      topK: topK ? Number.parseInt(topK.toString(), 10) : undefined,
    });

    return {
      data: result,
      message: 'Experience matches calculated successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job posting by ID' })
  @ApiResponse({
    status: 200,
    description: 'Job posting retrieved successfully',
    type: ApiResponseDto,
  })
  async getJobPosting(
    @CurrentUser() user: UserResponseDto,
    @Param() params: CalculateMatchParamsDto,
  ): Promise<ApiResponseDto<JobPostingResponse>> {
    const result = await this.findJobPostingByIdUseCase.execute({
      id: params.id,
      userId: user.id,
    });

    return {
      data: result,
      message: 'Job posting retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }
}
