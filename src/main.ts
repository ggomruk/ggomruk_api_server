import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  const corsOrigin = configService.get<string[]>('app.corsOrigin', [
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

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Ggomruk API')
    .setDescription('Algorithmic Trading and Backtesting API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('algo', 'Algorithm and Backtest endpoints')
    .addTag('user', 'User management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Enable shutdown hooks
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}/${apiVersion}`,
  );
  logger.log(`📝 Environment: ${configService.get('app.env')}`);
  logger.log(`🌐 CORS enabled for: ${corsOrigin.join(', ')}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();