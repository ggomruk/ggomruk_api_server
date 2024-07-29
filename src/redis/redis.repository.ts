import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisRepositoryInterface } from './redis.repository.interface';
import Redis from 'ioredis';

@Injectable()
export class RedisRepoistory
  implements OnModuleDestroy, RedisRepositoryInterface
{
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}
  onModuleDestroy() {
    this.redisClient.disconnect();
  }
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }
  async set(key: string, value: string): Promise<boolean> {
    return this.redisClient
      .set(key, value)
      .then((res) => (res === 'OK' ? true : false))
      .catch(() => false);
  }
  async delete(key: string): Promise<boolean> {
    return this.redisClient
      .del(key)
      .then(() => true)
      .catch(() => false);
  }
  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }
  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.redisClient.publish(channel, message);
    } catch (err) {
      return err;
    }
  }
  async subscribe(channel: string, callback: (message: string) => void) {
    this.redisClient.subscribe(channel);
    this.redisClient.on('message', (_channel, message) => {
      if (_channel === channel) {
        callback(message);
      }
    });
  }
}
