import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';

import { TopicsService } from '@/topics/topics.service';
import { CreateTopicDto } from '@/topics/dto/create-topic.dto';
import { UpdateTopicDto } from '@/topics/dto/update-topic.dto';
import { TopicResponseDto } from '@/topics/dto/topic-response.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserResponseDto } from '@/users/dto/user-response.dto';

@ApiTags('topics')
@ApiBearerAuth('JWT')
@ApiExtraModels(TopicResponseDto)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiBody({ type: CreateTopicDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Topic created successfully',
    type: TopicResponseDto
  })
  create(
    @CurrentUser() user: UserResponseDto,
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.create(user.id, createTopicDto);
  }

  @Get('experience/:experienceId')
  @ApiOperation({ summary: 'Get all topics for an experience' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of topics',
    type: [TopicResponseDto]
  })
  findAllByExperience(
    @CurrentUser() user: UserResponseDto,
    @Param('experienceId') experienceId: string,
  ): Promise<TopicResponseDto[]> {
    return this.topicsService.findAllByExperience(user.id, experienceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a topic by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic found',
    type: TopicResponseDto
  })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  findOne(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
  ): Promise<TopicResponseDto> {
    return this.topicsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a topic' })
  @ApiBody({ type: UpdateTopicDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic updated successfully',
    type: TopicResponseDto
  })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  update(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.update(user.id, id, updateTopicDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiResponse({ 
    status: 200, 
    description: 'Topic deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Topic deleted successfully'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  remove(
    @CurrentUser() user: UserResponseDto,
    @Param('id') id: string,
  ): Promise<void> {
    return this.topicsService.remove(user.id, id);
  }
} 