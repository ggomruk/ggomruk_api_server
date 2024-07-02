import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AlgoService {
  private readonly logger = new Logger(AlgoService.name);
}
