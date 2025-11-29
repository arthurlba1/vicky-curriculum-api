import { Body, Controller, Delete, Get, Param, Post, Put, Sse } from '@nestjs/common';
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
import { ListExperienceSummaryUseCase } from '@/experiences/use-cases/list-experience-summary.use-case';
import { CreateExperienceUseCase } from '@/experiences/use-cases/create-experience.use-case';
import { UpdateExperienceUseCase } from '@/experiences/use-cases/update-experience.use-case';
import { DeleteExperienceUseCase } from '@/experiences/use-cases/delete-experience.use-case';
import { ListExperiencesParamsDto } from '@/experiences/dto/list-experiences.params';
import { DeleteExperienceParamsDto } from '@/experiences/dto/delete-experience.params';
import { CreateExperienceInput } from '@/experiences/dto/create-experience.input';
import { ExperienceSummary } from '@/experiences/dto/experience-summary.dto';
import { ExperienceSummaryWithSkills } from '@/experiences/dto/experience-summary-with-skills.dto';
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
    ExperienceSummaryWithSkills,
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
    private readonly listExperienceSummaryUseCase: ListExperienceSummaryUseCase,
    private readonly createExperienceUseCase: CreateExperienceUseCase,
    private readonly updateExperienceUseCase: UpdateExperienceUseCase,
    private readonly deleteExperienceUseCase: DeleteExperienceUseCase,
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

  @Get('list-experience-summary')
  @ApiOperation({ summary: 'List all experiences with aggregated skills (without AIS units)' })
  @ApiResponse({
    status: 200,
    description: 'Experience summaries with skills retrieved successfully',
    type: ApiResponseDto,
  })
  async listExperienceSummary(
    @CurrentUser() user: UserResponseDto,
  ): Promise<ApiResponseDto<ExperienceSummaryWithSkills[]>> {
    const experiences = await this.listExperienceSummaryUseCase.execute({
      userId: user.id,
    });

    return {
      data: experiences,
      message: 'Experience summaries with skills retrieved successfully',
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

  @Delete(':experienceType/:experienceId')
  @ApiOperation({ summary: 'Delete an experience and all its AIS units' })
  @ApiResponse({
    status: 200,
    description: 'Experience deleted successfully',
    type: ApiResponseDto,
  })
  async deleteExperience(
    @CurrentUser() user: UserResponseDto,
    @Param() params: DeleteExperienceParamsDto,
  ): Promise<ApiResponseDto<void>> {
    await this.deleteExperienceUseCase.execute({
      userId: user.id,
      experienceId: params.experienceId,
      experienceType: params.experienceType,
    });

    return {
      data: undefined,
      message: 'Experience deleted successfully',
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
