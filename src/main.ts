import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ThrottleGuard } from './common/guards/throttle.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global route prefix
  app.setGlobalPrefix('api/v1');

  // Load Config and Logger
  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unexpected fields
      forbidNonWhitelisted: true, // Throw if extra fields exist
      transform: true, // Auto-transform DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Apply rate limiter globally
  app.useGlobalGuards(app.get(ThrottleGuard));

  // Register global interceptor to standardize responses
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Register global exception filter for consistent error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger API Docs Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('📘 Reading Recommendation API')
    .setDescription('Endpoints to submit reading intervals and get top book recommendations.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start the server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`Server is running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
