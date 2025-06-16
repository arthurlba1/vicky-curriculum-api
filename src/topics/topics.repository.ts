import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Topic } from '@/topics/entities/topic.entity';
import { CreateTopicDto } from '@/topics/dto/create-topic.dto';
import { UpdateTopicDto } from '@/topics/dto/update-topic.dto';

@Injectable()
export class TopicsRepository extends Repository<Topic> {
  constructor(private dataSource: DataSource) {
    super(Topic, dataSource.createEntityManager());
  }

  async findByExperienceId(experienceId: string): Promise<Topic[]> {
    return this.find({
      where: { experience_id: experienceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Topic | null> {
    return this.findOne({
      where: { id },
    });
  }

  async createTopic(createTopicDto: CreateTopicDto): Promise<Topic> {
    const topic = this.create(createTopicDto);
    return this.save(topic);
  }

  async updateTopic(id: string, updateTopicDto: UpdateTopicDto): Promise<Topic> {
    await this.update(id, updateTopicDto);
    return this.findById(id);
  }

  async deleteTopic(id: string): Promise<void> {
    await this.delete(id);
  }
}
