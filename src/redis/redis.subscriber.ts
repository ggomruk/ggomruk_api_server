import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class RedisSubscriberController {
  @MessagePattern('result')
  handleResult(@Payload() message: string) {
    console.log(message);
  }
}
