import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

import { CreateTopicDto } from '@/topics/dto/create-topic.dto';
import { UpdateTopicDto } from '@/topics/dto/update-topic.dto';
import { TopicResponseDto } from '@/topics/dto/topic-response.dto';
import { ExperiencesService } from '@/experiences/experiences.service';
import { TopicsRepository } from '@/topics/topics.repository';

@Injectable()
export class TopicsService {
  constructor(
    private readonly topicsRepository: TopicsRepository,
    private readonly experiencesService: ExperiencesService,
  ) {}

  async create(userId: string, createTopicDto: CreateTopicDto): Promise<TopicResponseDto> {
    await this.verifyExperienceOwnership(userId, createTopicDto.experienceId);

    const topic = await this.topicsRepository.createTopic(createTopicDto);
    return TopicResponseDto.fromEntity(topic);
  }

  async findAllByExperience(userId: string, experienceId: string): Promise<TopicResponseDto[]> {
    await this.verifyExperienceOwnership(userId, experienceId);

    const topics = await this.topicsRepository.findByExperienceId(experienceId);

    return topics.map(topic => TopicResponseDto.fromEntity(topic));
  }

  async findOne(userId: string, id: string): Promise<TopicResponseDto> {
    const topic = await this.topicsRepository.findById(id);

    await this.verifyExperienceOwnership(userId, topic.experienceId);

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    return TopicResponseDto.fromEntity(topic);
  }

  async update(
    userId: string,
    id: string,
    updateTopicDto: UpdateTopicDto,
  ): Promise<TopicResponseDto> {
    const topic = await this.topicsRepository.findById(id);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    await this.verifyExperienceOwnership(userId, topic.experienceId);
    const updatedTopic = await this.topicsRepository.updateTopic(id, updateTopicDto);

    return TopicResponseDto.fromEntity(updatedTopic);
  }

  async remove(userId: string, id: string): Promise<void> {
    const topic = await this.topicsRepository.findById(id);
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    await this.verifyExperienceOwnership(userId, topic.experienceId);
    await this.topicsRepository.deleteTopic(id);
  }

  private async verifyExperienceOwnership(userId: string, experienceId: string): Promise<void> {
    const experience = await this.experiencesService.findOne(userId, experienceId);
    if (!experience) {
      throw new ForbiddenException('You do not have access to this experience');
    }
  }
}