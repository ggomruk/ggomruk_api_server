import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BacktestService } from './backtest.service';
import { BacktestRequest, BacktestResponse } from './backtest.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

@Controller('backtest')
@UseGuards(JwtAuthGuard)
export class BacktestController {
  constructor(private readonly backtestService: BacktestService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runBacktest(
    @Body() backtestRequest: BacktestRequest,
    @Req() req: any,
  ): Promise<GeneralResponse<BacktestResponse>> {
    const userId = req.user?.userId || 'anonymous';
    const result = await this.backtestService.runBacktest(
      backtestRequest,
      userId,
    );
    return GeneralResponse.success(result, 'Backtest started successfully');
  }

  @Get('history')
  async getHistory(@Req() req: any): Promise<GeneralResponse<any[]>> {
    const userId = req.user?.userId || 'anonymous';
    const history = await this.backtestService.getBacktestHistory(userId);
    return GeneralResponse.success(history);
  }

  @Get(':id')
  async getBacktestResult(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<GeneralResponse<any>> {
    const userId = req.user?.userId || 'anonymous';
    const result = await this.backtestService.getBacktestResult(id, userId);
    return GeneralResponse.success(result);
  }
}
