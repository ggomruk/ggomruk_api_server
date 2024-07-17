import { Injectable, Logger } from '@nestjs/common';
import { BacktestDTO } from './dto/backtest.dto';
import { v4 as uuidv4 } from 'uuid';
import { WebsocketClientService } from 'src/websocket/websocketClient.service';
import { E_Task } from './enum/task';

@Injectable()
export class AlgoService {
  private readonly logger = new Logger(AlgoService.name);

  constructor(
    private readonly websocketClientService: WebsocketClientService,
  ) {}

  runBacktest(data: BacktestDTO) {
    const task = E_Task.BACKTEST;
    const uidParts = uuidv4().split('-');
    const uid = uidParts[uidParts.length - 1];

    this.websocketClientService.sendBacktestData(task, uid, data);
  }
}
