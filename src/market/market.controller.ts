import { Controller, Get, Query } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('klines')
  async getKlines(
    @Query('symbol') symbol: string,
    @Query('interval') interval: string = '1m',
    @Query('limit') limit: number = 1000,
    @Query('endTime') endTime?: number, // Optional: fetch data before this timestamp
  ) {
    return this.marketService.getKlines(
      symbol,
      interval,
      Number(limit),
      endTime ? Number(endTime) : undefined,
    );
  }

  @Get('ticker')
  async getTicker(@Query('symbol') symbol: string) {
    return this.marketService.getTicker(symbol);
  }
}
