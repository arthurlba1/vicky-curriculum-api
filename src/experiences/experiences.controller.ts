import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ExperiencesService } from '@/experiences/experiences.service';
import { CreateExperienceDto } from '@/experiences/dto/create-experience.dto';
import { UpdateExperienceDto } from '@/experiences/dto/update-experience.dto';
import { ExperienceResponseDto } from '@/experiences/dto/experience-response.dto';
import { UserResponseDto } from '@/users/dto/user-response.dto';

@ApiTags('experiences')
@ApiBearerAuth('JWT')
@ApiExtraModels(ExperienceResponseDto)
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new experience' })
  @ApiBody({ type: CreateExperienceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Experience created successfully',
    type: ExperienceResponseDto
  })
  create(
    @CurrentUser() user: UserResponseDto,
    @Body() createExperienceDto: CreateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    return this.experiencesService.create(user.id, createExperienceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all experiences for the current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of experiences',
    type: [ExperienceResponseDto]
  })
  findAll(@CurrentUser() user: UserResponseDto): Promise<ExperienceResponseDto[]> {
    return this.experiencesService.findAll(user.id);
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
