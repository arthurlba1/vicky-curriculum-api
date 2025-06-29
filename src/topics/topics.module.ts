import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { Topic } from './topic.entity';
import { ExperiencesModule } from '@/experiences/experiences.module';
import { TopicsRepository } from './topics.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic]),
    ExperiencesModule,
  ],
  controllers: [TopicsController],
  providers: [TopicsService, TopicsRepository],
  exports: [TopicsService],
})
export class TopicsModule {}
