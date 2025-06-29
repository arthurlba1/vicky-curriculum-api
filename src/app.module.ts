import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { JwtAuthGlobalGuard } from '@/auth/guards/jwt-auth.global.guard';
import { ExperiencesModule } from '@/experiences/experiences.module';
import { TopicsModule } from '@/topics/topics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'vicky'),
        password: configService.get('DB_PASSWORD', 'vicky123'),
        database: configService.get('DB_DATABASE', 'vicky_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ExperiencesModule,
    TopicsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGlobalGuard,
    },
  ],
})
export class AppModule {}
