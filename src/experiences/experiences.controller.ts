import { Body, Controller, Get, Param, Post, Put, Sse } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Observable, map } from 'rxjs';

import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { ListExperiencesUseCase } from '@/experiences/use-cases/list-experiences.use-case';
import { ListAllExperiencesUseCase } from '@/experiences/use-cases/list-all-experiences.use-case';
import { CreateExperienceUseCase } from '@/experiences/use-cases/create-experience.use-case';
import { UpdateExperienceUseCase } from '@/experiences/use-cases/update-experience.use-case';
import { ListExperiencesParamsDto } from '@/experiences/dto/list-experiences.params';
import { CreateExperienceInput } from '@/experiences/dto/create-experience.input';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import { ExperienceWithAisUnitsResponseDto } from '@/experiences/dto/experience-with-ais-units.response';
import { AllExperiencesResponseDto } from '@/experiences/dto/all-experiences.response';
import { AisUnitResponse } from '@/experiences/dto/ais-unit/ais-unit.response';
import { UpdateExperienceInput } from '@/experiences/dto/update-experience.input';
import { CreateWorkExperienceInput } from '@/experiences/dto/create-work-experience.input';
import { CreateProjectExperienceInput } from '@/experiences/dto/create-project-experience.input';
import { CreateAcademicExperienceInput } from '@/experiences/dto/create-academic-experience.input';
import { CreateAisUnitInput } from '@/experiences/dto/ais-unit/create-ais-unit.input';
import { GenerateAisUnitsInput } from '@/experiences/dto/generate-ais-units.input';
import { GenerateAisUnitsFromDescriptionUseCase } from '@/experiences/use-cases/generate-ais-units-from-description.use-case';

@ApiTags('experiences')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(
  ApiResponseDto,
  ExperienceSummary,
  ExperienceWithAisUnitsResponseDto,
  AllExperiencesResponseDto,
  CreateExperienceInput,
  CreateWorkExperienceInput,
  CreateProjectExperienceInput,
  CreateAcademicExperienceInput,
  CreateAisUnitInput,
  AisUnitResponse,
  GenerateAisUnitsInput,
)
@Controller('experiences')
export class ExperiencesController {
  constructor(
    private readonly listExperiencesUseCase: ListExperiencesUseCase,
    private readonly listAllExperiencesUseCase: ListAllExperiencesUseCase,
    private readonly createExperienceUseCase: CreateExperienceUseCase,
    private readonly updateExperienceUseCase: UpdateExperienceUseCase,
    private readonly generateAisUnitsFromDescriptionUseCase: GenerateAisUnitsFromDescriptionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all experiences by type with AIS units' })
  @ApiResponse({
    status: 200,
    description: 'All experiences retrieved successfully',
    type: ApiResponseDto,
  })
  async listAllExperiences(
    @CurrentUser() user: UserResponseDto,
  ): Promise<ApiResponseDto<AllExperiencesResponseDto>> {
    const result = await this.listAllExperiencesUseCase.execute({
      userId: user.id,
    });

    return {
      data: result,
      message: 'All experiences retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Get(':experienceType')
  @ApiOperation({ summary: 'List experiences by type' })
  @ApiResponse({ 
    status: 200, 
    description: 'Experiences retrieved successfully',
    type: ApiResponseDto,
    isArray: false,
  })
  async listExperiences(
    @CurrentUser() user: UserResponseDto,
    @Param() params: ListExperiencesParamsDto,
  ): Promise<ApiResponseDto<ExperienceSummary[]>> {
    const experiences = await this.listExperiencesUseCase.execute({
      userId: user.id,
      experienceType: params.experienceType,
    });

    return {
      data: experiences,
      message: 'Experiences retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new experience' })
  @ApiResponse({
    status: 201,
    description: 'Experience created successfully',
  })
  async createExperience(
    @CurrentUser() user: UserResponseDto,
    @Body() body: CreateExperienceInput,
  ): Promise<ApiResponseDto<ExperienceWithAisUnitsResponseDto>> {
    const result = await this.createExperienceUseCase.execute({
      ...body,
      userId: user.id,
    });

    const data: ExperienceWithAisUnitsResponseDto = {
      experience: result.experience,
      aisUnits: result.aisUnits as AisUnitResponse[],
      skills: []
    };

    return {
      data,
      message: 'Experience created successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.CREATED,
    };
  }

  @Put(':experienceId')
  @ApiOperation({ summary: 'Update an existing experience (replaces AIS units)' })
  @ApiResponse({
    status: 200,
    description: 'Experience updated successfully',
    type: ApiResponseDto,
  })
  async updateExperience(
    @CurrentUser() user: UserResponseDto,
    @Param('experienceId') experienceId: string,
    @Body() body: UpdateExperienceInput,
  ): Promise<ApiResponseDto<ExperienceWithAisUnitsResponseDto>> {
    const result = await this.updateExperienceUseCase.execute({
      ...body,
      experienceId,
      userId: user.id,
    });

    const data: ExperienceWithAisUnitsResponseDto = {
      experience: result.experience,
      aisUnits: result.aisUnits as AisUnitResponse[],
      skills: [],
    };

    return {
      data,
      message: 'Experience updated successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Post('generate-ais')
  @Sse()
  @ApiOperation({ 
    summary: 'Generate AIS units from raw experience description (Streaming)',
    description: 'Server-Sent Events endpoint that streams AIS units as they are generated by the LLM. Takes a raw text description of an experience and uses AI to break it down into structured AIS (Action-Impact-Situation) units. Each event contains a complete AIS unit object with action, impact, context, and skills.',
  })
  @ApiResponse({
    status: 200,
    description: 'AIS units stream initiated successfully',
  })
  generateAisUnits(
    @CurrentUser() user: UserResponseDto,
    @Body() body: GenerateAisUnitsInput,
  ): Observable<MessageEvent> {
    return this.generateAisUnitsFromDescriptionUseCase.execute({
      ...body,
      userId: user.id,
    }).pipe(
      map((aisUnit) => ({
        data: JSON.stringify(aisUnit),
      } as MessageEvent)),
    );
  }
}
