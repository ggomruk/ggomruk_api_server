import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import helment from 'helmet';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const configService = appContext.get(ConfigService);

  const rabbitMQConfig = configService.get(`rabbitMQ.${process.env.NODE_ENV}`);
  const rabbitMqUrl =
    process.env.NODE_ENV === 'prod'
      ? `amqp://${rabbitMQConfig.username}:${rabbitMQConfig.password}@${rabbitMQConfig.host}:${rabbitMQConfig.port}`
      : `amqp://${rabbitMQConfig.host}:${rabbitMQConfig.port}`;

  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helment());
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: 'algo_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
