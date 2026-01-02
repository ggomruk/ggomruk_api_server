import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PUBLISHER } from '../redis.provider';

@Injectable()
export default class RedisMessageQueueClient {
  private readonly logger = new Logger(RedisMessageQueueClient.name);

  constructor(@Inject(REDIS_PUBLISHER) private readonly redisClient: Redis) {}

  private addTimestamp(message: string) {
    const metadata = { timestamp: new Date().toISOString() };
    return JSON.stringify({ ...JSON.parse(message), ...metadata });
  }

  public async publish(topic: string, message: any) {
    const data = this.addTimestamp(message);
    try {
      await this.redisClient.publish(topic, data);
      this.logger.log(`Published message: ${data} to topic: ${topic}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish message: ${data} to topic: ${topic}`,
      );
      this.retryPublish(topic, data);
    }
  }

  async retryPublish(channel: string, message: string) {
    let retry = 0;
    const maxRetry = 3;
    const delay = 5000;
    while (retry < maxRetry) {
      try {
        this.redisClient.publish(channel, message);
        this.logger.log(`Published message: ${message} to channel: ${channel}`);
        return;
      } catch (error) {
        this.logger.warn(`Retry ${retry} failed: ${error.message}`);
        if (retry === maxRetry) {
          throw new Error('Max retry limit reached');
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        retry++;
      }
    }
  }
}
