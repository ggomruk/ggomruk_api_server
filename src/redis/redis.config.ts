import { registerAs } from '@nestjs/config';
export default registerAs('redis', () => {
  const isProduction = process.env.NODE_ENV === 'prod';
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    username: isProduction ? process.env.REDIS_USERNAME : '',
    password: isProduction ? process.env.REDIS_PASSWORD : '',
    maxRetriesPerRequest:
      parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST) || 5,
  };
});
