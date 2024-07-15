import { Injectable, Logger } from '@nestjs/common';
import { BacktestDTO } from './dto/backtest.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AlgoService {
  private readonly logger = new Logger(AlgoService.name);

  runBacktest(data: BacktestDTO) {
    const uidParts = uuidv4().split('-');
    let uid = uidParts[uidParts.length - 1];

    console.log(uid);
  }
}
