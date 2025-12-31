import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Alert, AlertDocument } from './schemas/alert.schema';
import { CreateAlertDTO, AlertType, AlertStatus } from './dto/create-alert.dto';
import { WebsocketGateway } from 'src/domain/websocket/websocketGateway';
import axios from 'axios';

@Injectable()
export class AlertsService implements OnModuleInit {
  private readonly logger = new Logger(AlertsService.name);
  private priceCache = new Map<string, number>();

  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  onModuleInit() {
    this.logger.log('Alerts service initialized - starting price monitoring');
  }

  /**
   * Create a new price/signal alert
   */
  async createAlert(userId: string, dto: CreateAlertDTO): Promise<AlertDocument> {
    const alert = new this.alertModel({
      userId,
      ...dto,
      status: AlertStatus.ACTIVE,
    });

    await alert.save();
    this.logger.log(`Created alert ${alert._id} for user ${userId}`);
    
    return alert;
  }

  /**
   * Get all alerts for a user
   */
  async getUserAlerts(userId: string): Promise<AlertDocument[]> {
    return this.alertModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get active alerts only
   */
  async getActiveAlerts(userId: string): Promise<AlertDocument[]> {
    return this.alertModel.find({ userId, status: AlertStatus.ACTIVE }).exec();
  }

  /**
   * Cancel an alert
   */
  async cancelAlert(userId: string, alertId: string): Promise<boolean> {
    const result = await this.alertModel.updateOne(
      { _id: alertId, userId },
      { status: AlertStatus.CANCELLED }
    );
    
    return result.modifiedCount > 0;
  }

  /**
   * Delete an alert
   */
  async deleteAlert(userId: string, alertId: string): Promise<boolean> {
    const result = await this.alertModel.deleteOne({ _id: alertId, userId });
    return result.deletedCount > 0;
  }

  /**
   * Check alerts every minute (runs via cron job)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAlerts() {
    try {
      const activeAlerts = await this.alertModel.find({ status: AlertStatus.ACTIVE }).exec();
      
      if (activeAlerts.length === 0) {
        return;
      }

      this.logger.debug(`Checking ${activeAlerts.length} active alerts`);

      // Get unique symbols
      const symbols = [...new Set(activeAlerts.map(a => a.symbol))];
      
      // Fetch current prices
      await this.updatePrices(symbols);

      // Check each alert
      for (const alert of activeAlerts) {
        const currentPrice = this.priceCache.get(alert.symbol);
        
        if (!currentPrice) {
          continue;
        }

        const shouldTrigger = this.checkAlertCondition(alert, currentPrice);
        
        if (shouldTrigger) {
          await this.triggerAlert(alert, currentPrice);
        }
      }
    } catch (error) {
      this.logger.error(`Error checking alerts: ${error.message}`);
    }
  }

  /**
   * Update price cache from Binance API
   */
  private async updatePrices(symbols: string[]): Promise<void> {
    try {
      // Fetch from Binance API (or your data source)
      const promises = symbols.map(async (symbol) => {
        try {
          const response = await axios.get(
            `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
            { timeout: 5000 }
          );
          
          const price = parseFloat(response.data.price);
          this.priceCache.set(symbol, price);
        } catch (error) {
          this.logger.warn(`Failed to fetch price for ${symbol}: ${error.message}`);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      this.logger.error(`Error updating prices: ${error.message}`);
    }
  }

  /**
   * Check if alert condition is met
   */
  private checkAlertCondition(alert: AlertDocument, currentPrice: number): boolean {
    switch (alert.alertType) {
      case AlertType.PRICE_ABOVE:
        return currentPrice >= alert.targetValue;
      
      case AlertType.PRICE_BELOW:
        return currentPrice <= alert.targetValue;
      
      case AlertType.PRICE_CHANGE_PERCENT:
        // Would need historical price data for this
        // Simplified: just check if price moved significantly
        return false; // Implement based on your needs
      
      case AlertType.INDICATOR_SIGNAL:
        // Would need to calculate indicator values
        // This requires integration with your strategy indicators
        return false; // Implement based on your needs
      
      default:
        return false;
    }
  }

  /**
   * Trigger an alert - mark as triggered and notify user
   */
  private async triggerAlert(alert: AlertDocument, currentPrice: number): Promise<void> {
    try {
      // Update alert status
      await this.alertModel.updateOne(
        { _id: alert._id },
        {
          status: AlertStatus.TRIGGERED,
          triggeredAt: new Date(),
          triggeredPrice: currentPrice,
        }
      );

      this.logger.log(`Alert ${alert._id} triggered for ${alert.symbol} at ${currentPrice}`);

      // Notify user via WebSocket
      this.websocketGateway.emitAlertTriggered(alert.userId, {
        alertId: alert._id.toString(),
        symbol: alert.symbol,
        alertType: alert.alertType,
        targetValue: alert.targetValue,
        currentPrice,
        message: alert.message || `${alert.symbol} ${alert.alertType} ${alert.targetValue}`,
        triggeredAt: new Date(),
      });

      // TODO: Send email/push notification if configured
      
    } catch (error) {
      this.logger.error(`Error triggering alert ${alert._id}: ${error.message}`);
    }
  }

  /**
   * Get current price for a symbol (from cache or fetch)
   */
  async getCurrentPrice(symbol: string): Promise<number | null> {
    if (this.priceCache.has(symbol)) {
      return this.priceCache.get(symbol) || null;
    }

    try {
      const response = await axios.get(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
        { timeout: 5000 }
      );
      
      const price = parseFloat(response.data.price);
      this.priceCache.set(symbol, price);
      return price;
    } catch (error) {
      this.logger.error(`Failed to fetch price for ${symbol}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get alert statistics for user
   */
  async getAlertStats(userId: string): Promise<any> {
    const all = await this.alertModel.countDocuments({ userId });
    const active = await this.alertModel.countDocuments({ userId, status: AlertStatus.ACTIVE });
    const triggered = await this.alertModel.countDocuments({ userId, status: AlertStatus.TRIGGERED });
    const cancelled = await this.alertModel.countDocuments({ userId, status: AlertStatus.CANCELLED });

    return {
      total: all,
      active,
      triggered,
      cancelled,
    };
  }
}
