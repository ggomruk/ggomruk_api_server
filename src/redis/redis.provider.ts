import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Shared Redis connection providers
 * These create reusable Redis connections to avoid connection overhead
 */

export const REDIS_PUBLISHER = 'REDIS_PUBLISHER';
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';
export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Factory function to create Redis connection options
 */
function createRedisOptions(configService: ConfigService): any {
  const redisConfig = configService.get('redis');
  
  const options: any = {
    host: redisConfig.host,
    port: redisConfig.port,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, redisConfig.delay || 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  };

  // Only add password if it exists and is not empty
  if (redisConfig.password && redisConfig.password.trim() !== '') {
    options.password = redisConfig.password;
  }

  return options;
}

/**
 * Redis Publisher - Used for publishing messages
 * Shared across all services that need to publish
 */
export const RedisPublisherProvider: Provider = {
  provide: REDIS_PUBLISHER,
  useFactory: (configService: ConfigService) => {
    const options = createRedisOptions(configService);
    const client = new Redis(options);
    
    client.on('connect', () => {
      console.log('✅ Redis Publisher connected');
    });
    
    client.on('error', (err) => {
      console.error('❌ Redis Publisher error:', err.message);
    });
    
    return client;
  },
  inject: [ConfigService],
};

/**
 * Redis Subscriber - Used for subscribing to channels
 * Separate connection required for Pub/Sub pattern
 */
export const RedisSubscriberProvider: Provider = {
  provide: REDIS_SUBSCRIBER,
  useFactory: (configService: ConfigService) => {
    const options = createRedisOptions(configService);
    const client = new Redis(options);
    
    client.on('connect', () => {
      console.log('✅ Redis Subscriber connected');
    });
    
    client.on('error', (err) => {
      console.error('❌ Redis Subscriber error:', err.message);
    });
    
    return client;
  },
  inject: [ConfigService],
};

/**
 * Redis Client - General purpose Redis client for caching
 * Used for get/set/delete operations
 */
export const RedisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService) => {
    const options = createRedisOptions(configService);
    const client = new Redis(options);
    
    client.on('connect', () => {
      console.log('✅ Redis Client connected');
    });
    
    client.on('error', (err) => {
      console.error('❌ Redis Client error:', err.message);
    });
    
    return client;
  },
  inject: [ConfigService],
};

/**
 * Export all providers as an array for easy import
 */
export const RedisProviders = [
  RedisPublisherProvider,
  RedisSubscriberProvider,
  RedisClientProvider,
];
