import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";

@Injectable()
export default class RedisMessageQueueClient {
    private redisClient: ClientProxy;

    constructor(config: ConfigService) {
        this.redisClient = ClientProxyFactory.create({
            transport: Transport.REDIS,
            options: {
                host: 'localhost',
                port: 6379
            }
        });
    }

    public send_message(topic: string, message: any) {
        this.redisClient.emit(topic, message);
    }
}