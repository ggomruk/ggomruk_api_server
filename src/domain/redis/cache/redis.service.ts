import { Injectable, Logger } from '@nestjs/common';
import { RedisRepoistory } from './redis.repository';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  constructor(private readonly repository: RedisRepoistory) {}

  async publishBacktestData(channel: string, message: string) {
    this.logger.log(`Publishing message: ${message} to channel: ${channel}`);

    const msg = this.addTimestamp(message);
    try {
      await this.repository.publish(channel, message);
    } catch (error) {
      await this.retryPublish(channel, msg);
    }
  }

  async getValue(key: string): Promise<string> {
    this.logger.log(`Getting value for key: ${key}`);
    return this.repository.get(key);
  }

  async setValue(key: string, value: string): Promise<boolean> {
    this.logger.log(`Setting value for key: ${key}`);
    return this.repository.set(key, value);
  }

  addTimestamp(message: string) {
    const metadata = { timestamp: new Date().toISOString() };
    return JSON.stringify({ ...JSON.parse(message), ...metadata });
  }

  async retryPublish(channel: string, message: string) {
    let retry = 0;
    const maxRetry = 3;
    const delay = 5000;
    while (retry < maxRetry) {
      try {
        await this.repository.publish(channel, message);
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
