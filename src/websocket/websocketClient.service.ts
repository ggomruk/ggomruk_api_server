import { Inject, Injectable, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { BacktestDTO as ApiBacktestDto } from 'src/algo/dto/backtest.dto';
import * as WebSocket from 'ws';
import { BacktestDTO as WsBacktestDTO } from './dto/backtest.dto';
import { E_Task } from 'src/algo/enum/task';
import { MODULE_OPTIONS_TOKEN } from './websocket.moduleDefinition';
import { IWebsocketConfig } from './interfaces/websocketConfig.interface';

@Injectable()
export class WebsocketClientService {
  private logger = new Logger(WebsocketClientService.name);
  private wsClient: WebSocket;
  private reconnectAttempts = 0;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: IWebsocketConfig) {
    let { wsUrl, wsPort } = options;
    this.connect(`${wsUrl}:${wsPort}`);
  }

  private connect(url: string) {
    this.wsClient = new WebSocket(url);

    this.wsClient.on('open', () => this.onOpen());
    this.wsClient.on('message', (data) => this.onMessage(data));
    this.wsClient.on('close', () => this.onClose());
    this.wsClient.on('error', this.logger.error);
  }

  protected onOpen() {
    this.logger.debug('Connected to Websocket server => ws://localhost:8765');
  }
  protected onClose() {
    this.logger.debug(`Websocket Connection closed`);
    this.reconnectAttempts++;
    if (this.reconnectAttempts < 5) {
      setTimeout(() => {
        this.logger.debug(`Reconnecting to ws://localhost:8765`);
        this.connect('ws://localhost:8765');
      }, 10 * 1000);
    } else {
      this.logger.error('Max reconnect attempts reached');
      // Critical Error
    }
  }
  protected onMessage(data: any) {
    if (Buffer.isBuffer(data)) {
      const message = data.toString('utf-8');
      try {
        const jsonData = JSON.parse(message);
        console.log('Received data from websocket server');
        if (jsonData['ok']) {
          const { task, result } = jsonData;
          if (task == E_Task.BACKTEST) {
            // Backtest result
            console.log('Backtest result:', result);
          } else if (task == E_Task.TRADE) {
            console.log('Trade');
          }
        }
        console.log(jsonData);
      } catch (err) {
        this.logger.error('Error while parsing message');
      }
    }
  }

  public async sendBacktestData(
    task: string,
    uid: string,
    backtestData: ApiBacktestDto,
  ) {
    const errors = await validate(backtestData);
    if (errors.length) {
      this.logger.error('Validation failed');
      throw new Error('Validation failed');
    }
    const data = WsBacktestDTO.fromApiBacktestDto(task, uid, backtestData);
    this.wsClient.send(JSON.stringify(data), (err) => {
      if (err) {
        this.logger.error('Error while sending data to websocket');
      }
    });
  }
}
