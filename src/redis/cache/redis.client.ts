import { ClientProxyFactory, Transport } from "@nestjs/microservices";


export class RedisClient {
    static client: ClientProxyFactory;

    static create() {
        RedisClient.client = ClientProxyFactory.create({
            transport: Transport.REDIS,
            options: {
                host: 'localhost',
                port: 6379
            }
        });
    }
}