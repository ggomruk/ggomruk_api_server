import { Controller, Get, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('klines')
  async getKlines(
    @Query('symbol') symbol: string,
    @Query('interval') interval: string = '1m',
    @Query('limit') limit: number = 1000,
    @Query('endTime') endTime?: number, // Optional: fetch data before this timestamp
  ): Promise<GeneralResponse<any>> {
    const result = await this.marketService.getKlines(
      symbol,
      interval,
      Number(limit),
      endTime ? Number(endTime) : undefined,
    );
    return GeneralResponse.success(result);
  }

  @Get('ticker')
  async getTicker(@Query('symbol') symbol: string): Promise<GeneralResponse<any>> {
    const result = await this.marketService.getTicker(symbol);
    return GeneralResponse.success(result);
  }
}
