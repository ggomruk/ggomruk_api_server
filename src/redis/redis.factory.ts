import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'REDIS_CLIENT',
  useFactory: (config: ConfigService) => {
    const redisConfig = config.get('redis');
    const redisClient = new Redis({
      ...redisConfig,
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    redisClient.on('error', (error) => {
      console.error('Error connecting to Redis: ', error);
    });

    return redisClient;
  },
  inject: [ConfigService],
};
