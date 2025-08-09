import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ExperiencesService } from '@/experiences/experiences.service';
import { CreateExperienceDto, CreateExperiencesDto } from '@/experiences/dto/create-experience.dto';
import { UpdateExperienceDto } from '@/experiences/dto/update-experience.dto';
import { ExperienceResponseDto } from '@/experiences/dto/experience-response.dto';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { ApiCreateBatchExperienceDocumentation, ApiCreateExperienceDocumentation, ApiGetAllExperiencesDocumentation } from '@/experiences/decorators/experience-swagger.decorator';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';

@ApiTags('experiences')
@ApiBearerAuth('JWT')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post()
  @ApiCreateExperienceDocumentation()
  async create(
    @CurrentUser() user: UserResponseDto,
    @Body() createExperienceDto: CreateExperienceDto,
  ): Promise<ApiResponseDto<void>> {
    return {
      data: await this.experiencesService.create(user.id, createExperienceDto),
      message: 'Experience created successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.CREATED,
    };
  }

  @Post('batch')
  @ApiCreateBatchExperienceDocumentation()
  async createBatch(
    @CurrentUser() user: UserResponseDto,
    @Body() createExperiencesDto: CreateExperiencesDto,
  ): Promise<ApiResponseDto<void>> {
    return {
      data: await this.experiencesService.createBatch(user.id, createExperiencesDto),
      message: 'Experiences created successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.CREATED,
    };
  }

  @Get()
  @ApiGetAllExperiencesDocumentation()
  async findAll(@CurrentUser() user: UserResponseDto): Promise<ApiResponseDto<ExperienceResponseDto[]>> {
    return {
      data: await this.experiencesService.findAll(user.id),
      message: 'Experiences retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an experience by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Experience found',
    type: ExperienceResponseDto
  })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  findOne(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
  ): Promise<ExperienceResponseDto> {
    return this.experiencesService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an experience' })
  @ApiBody({ type: UpdateExperienceDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Experience updated successfully',
    type: ExperienceResponseDto
  })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  update(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    return this.experiencesService.update(user.id, id, updateExperienceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an experience' })
  @ApiResponse({ 
    status: 200, 
    description: 'Experience deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Experience deleted successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  remove(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
  ): Promise<void> {
    return this.experiencesService.remove(user.id, id);
  }
}
