import { Module } from "@nestjs/common";
import { RedisClientProvider } from '../redis.provider';
import { RedisRepoistory } from './redis.repository';
import { RedisService } from './redis.service';

@Module({
    imports: [],
    providers: [
        RedisClientProvider,
        RedisRepoistory,
        RedisService
    ],
    controllers: [],
    exports: [
        RedisService,
        RedisRepoistory
    ]
})
export class RedisCacheModule {}