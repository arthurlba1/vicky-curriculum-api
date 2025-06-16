import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { TopicsService } from '@/topics/topics.service';
import { CreateTopicDto } from '@/topics/dto/create-topic.dto';
import { UpdateTopicDto } from '@/topics/dto/update-topic.dto';
import { TopicResponseDto } from '@/topics/dto/topic-response.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserResponseDto } from '@/users/dto/user-response.dto';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  create(
    @CurrentUser() user: UserResponseDto,
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.create(user.id, createTopicDto);
  }

  @Get('experience/:experienceId')
  findAllByExperience(
    @CurrentUser() user: UserResponseDto,
    @Param('experienceId') experienceId: string,
  ): Promise<TopicResponseDto[]> {
    return this.topicsService.findAllByExperience(user.id, experienceId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,

  ): Promise<TopicResponseDto> {
    return this.topicsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.update(user.id, id, updateTopicDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
  ): Promise<void> {
    return this.topicsService.remove(user.id, id);
  }
} 