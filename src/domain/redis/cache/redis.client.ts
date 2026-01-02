import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export class RedisClient {
  static client: ClientProxyFactory;

  static create(configService: ConfigService) {
    const redisConfig = configService.get('redis');
    RedisClient.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    });
  }
}
