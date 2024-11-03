import { Module } from "@nestjs/common";
import RedisMessageQueueClient from "./redis.mq.client";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [],
    providers: [
        {
            provide: 'REDIS_MESSAGE_QUEUE_CLIENT',
            useFactory: (config: ConfigService) => {
                const redisConfig = config.get('redis');
                return new RedisMessageQueueClient(redisConfig);
            },
            inject: [ConfigService]
        }
    ],
    controllers: [],
})
export class RedisMessageQueueModel {}