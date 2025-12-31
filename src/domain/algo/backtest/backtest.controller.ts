import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BacktestService } from './backtest.service';
import { BacktestRequest, BacktestResponse } from './backtest.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('backtest')
@UseGuards(JwtAuthGuard)
export class BacktestController {
  constructor(private readonly backtestService: BacktestService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runBacktest(
    @Body() backtestRequest: BacktestRequest,
    @Req() req: any,
  ): Promise<BacktestResponse> {
    const userId = req.user?.userId || 'anonymous';
    return this.backtestService.runBacktest(backtestRequest, userId);
  }

  @Get('history')
  async getHistory(@Req() req: any): Promise<any[]> {
    const userId = req.user?.userId || 'anonymous';
    return this.backtestService.getBacktestHistory(userId);
  }
}
