import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiService } from '@/ai/ai.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
