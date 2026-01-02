import { registerAs } from '@nestjs/config';

interface IRedisConfig {
  host: string;
  port: number;
  password: string;
  retry: number;
  delay: number;
}

export default registerAs<IRedisConfig>('redis', () => ({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  password: process.env.REDIS_PASSWORD,
  retry: parseInt(process.env.REDIS_RETRY, 10),
  delay: parseInt(process.env.REDIS_DELAY, 10),
}));

export { IRedisConfig };
