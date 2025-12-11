import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    snapshot: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port')
  const apiPrefix = configService.get<string>('app.apiPrefix');
  const apiVersion = configService.get<string>('app.apiVersion');
  const corsOrigin = configService.get<string[]>('cors.corsOrigin', [
    'http://localhost:3000',
  ]);

  // Set global prefix
  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  // Middleware
  app.use(compression());
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
    })
  )

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable shutdown hooks
  app.enableShutdownHooks();

  await app.listen(4000);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}/${apiVersion}`,
  );
  logger.log(`📝 Environment: ${configService.get('app.env')}`);
  logger.log(`🌐 CORS enabled for: ${corsOrigin.join(', ')}`);
}
bootstrap();