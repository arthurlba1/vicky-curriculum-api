import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExperiencesService } from '@/experiences/experiences.service';
import { ExperiencesController } from '@/experiences/experiences.controller';
import { Experience } from '@/experiences/experience.entity';
import { ExperiencesRepository } from '@/experiences/experiences.repository';
import { TopicsModule } from '@/topics/topics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experience]),
    forwardRef(() => TopicsModule)
  ],
  controllers: [ExperiencesController],
  providers: [ExperiencesService, ExperiencesRepository],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
