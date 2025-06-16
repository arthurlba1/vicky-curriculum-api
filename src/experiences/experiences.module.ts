import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController } from './experiences.controller';
import { Experience } from './experience.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Experience])],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
