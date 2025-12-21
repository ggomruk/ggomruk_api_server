import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface KlineData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 1 * 60 * 1000; // 1 minute cache

  async getKlines(
    symbol: string,
    interval: string,
    limit: number,
    endTime?: number, // Optional: fetch data before this timestamp
  ): Promise<KlineData[]> {
    const cacheKey = `${symbol}_${interval}_${limit}_${endTime || 'latest'}`;
    const cached = this.cache.get(cacheKey);

    // Return cache if valid (within 1 minute)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    this.logger.log(
      `Fetching ${limit} candles for ${symbol} (${interval})${endTime ? ` before ${new Date(endTime)}` : ''}`,
    );

    try {
      // For now, fetch from Binance (later: query database)
      const params: any = {
        symbol,
        interval,
        limit: Math.min(limit, 1500), // Binance max is 1500
      };

      // Add endTime if provided (for lazy loading historical data)
      if (endTime) {
        params.endTime = endTime;
      }

      const response = await axios.get(
        'https://api.binance.com/api/v3/klines',
        { params },
      );

      const data: KlineData[] = response.data.map((item: any[]) => ({
        time: item[0] / 1000, // Convert to seconds
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
      }));

      // Cache it
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch klines: ${error.message}`);
      throw error;
    }
  }

  async getTicker(symbol: string) {
    try {
      const response = await axios.get(
        'https://api.binance.com/api/v3/ticker/24hr',
        {
          params: { symbol },
        },
      );

      return {
        symbol: response.data.symbol,
        lastPrice: parseFloat(response.data.lastPrice),
        priceChange: parseFloat(response.data.priceChange),
        priceChangePercent: parseFloat(response.data.priceChangePercent),
        highPrice: parseFloat(response.data.highPrice),
        lowPrice: parseFloat(response.data.lowPrice),
        volume: parseFloat(response.data.volume),
        openPrice: parseFloat(response.data.openPrice),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch ticker: ${error.message}`);
      throw error;
    }
  }
}
