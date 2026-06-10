import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './common/logging/logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter(logger));

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  app.enableCors({
    origin:
      nodeEnv === 'development'
        ? true
        : configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
  });

  const port = configService.get<number>('PORT', 3001);

  await app.listen(port);
  logger.log(`Backend listening on port ${String(port)}`, 'Bootstrap');
}

void bootstrap();
