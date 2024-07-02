import { Controller, Get, Logger, Post } from '@nestjs/common';

@Controller('/api/algo')
export class AlgoController {
  private readonly logger = new Logger(AlgoController.name);
  @Get('list')
  getAlgorithms() {}

  @Post('register')
  registerAlgorithm() {}

  @Get('result')
  getTestResult() {}

  @Post('backtest')
  backtest() {}
}
