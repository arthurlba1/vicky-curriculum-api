import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ExperiencesService } from '@/experiences/experiences.service';
import { CreateExperienceDto } from '@/experiences/dto/create-experience.dto';
import { UpdateExperienceDto } from '@/experiences/dto/update-experience.dto';
import { ExperienceResponseDto } from '@/experiences/dto/experience-response.dto';
import { UserResponseDto } from '@/users/dto/user-response.dto';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post()
  create(
    @CurrentUser() user: UserResponseDto,
    @Body() createExperienceDto: CreateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    return this.experiencesService.create(user.id, createExperienceDto);
  }

  @Get()
  findAll(@CurrentUser() user: UserResponseDto): Promise<ExperienceResponseDto[]> {
    return this.experiencesService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
  ): Promise<ExperienceResponseDto> {
    return this.experiencesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    return this.experiencesService.update(user.id, id, updateExperienceDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
  ): Promise<void> {
    return this.experiencesService.remove(user.id, id);
  }
} 