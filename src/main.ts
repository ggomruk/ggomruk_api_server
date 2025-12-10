import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const apiPrefix = configService.get<string>('app.apiPrefix');
  const apiVersion = configService.get<string>('app.apiVersion');
  const corsOrigin = configService.get<string[]>('cors.corsOrigin', [
    'http://localhost:3000',
  ]);
  const redisConfig = configService.get('redis');

  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);


  // Security
  app.use(compression());
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }));
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });


  const redisOptions: any = {
    host: redisConfig.host,
    port: redisConfig.port,
  };
  
  // Only add password if it exists and is not empty
  if (redisConfig.password && redisConfig.password.trim() !== '') {
    redisOptions.password = redisConfig.password;
  }
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: redisOptions,
  });
  await app.startAllMicroservices();
  await app.listen(4000);
}
bootstrap();
