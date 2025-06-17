import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { swaggerConfig } from '@/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Setup Swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
