import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDTO } from './dto/create-alert.dto';
import { JwtAuthGuard } from 'src/domain/auth/guards/jwt-auth.guard';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a price or signal alert',
    description:
      'Set up an alert to be notified when price or indicator conditions are met.',
  })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async createAlert(
    @Body() dto: CreateAlertDTO,
    @Request() req: any,
  ): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    const result = await this.alertsService.createAlert(userId, dto);
    return GeneralResponse.success(result);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all alerts for the current user',
    description: 'Retrieve all alerts (active, triggered, and cancelled).',
  })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  async getUserAlerts(@Request() req: any): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    const result = await this.alertsService.getUserAlerts(userId);
    return GeneralResponse.success(result);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active alerts only',
    description:
      'Retrieve only alerts that are currently active and monitoring.',
  })
  @ApiResponse({ status: 200, description: 'Active alerts retrieved' })
  async getActiveAlerts(@Request() req: any): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    const result = await this.alertsService.getActiveAlerts(userId);
    return GeneralResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get alert statistics',
    description:
      'Get counts of total, active, triggered, and cancelled alerts.',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getAlertStats(@Request() req: any): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    const result = await this.alertsService.getAlertStats(userId);
    return GeneralResponse.success(result);
  }

  @Get('price/:symbol')
  @ApiOperation({
    summary: 'Get current price for a symbol',
    description: 'Fetch the latest price from the price cache or Binance API.',
  })
  @ApiResponse({ status: 200, description: 'Price retrieved' })
  async getCurrentPrice(
    @Param('symbol') symbol: string,
  ): Promise<GeneralResponse<any>> {
    const price = await this.alertsService.getCurrentPrice(symbol);
    return GeneralResponse.success({ symbol, price, timestamp: new Date() });
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancel an alert',
    description: 'Cancel an active alert without deleting it.',
  })
  @ApiResponse({ status: 200, description: 'Alert cancelled' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async cancelAlert(
    @Param('id') alertId: string,
    @Request() req: any,
  ): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    await this.alertsService.cancelAlert(userId, alertId);
    return GeneralResponse.success({ message: 'Alert cancelled successfully' });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an alert',
    description: 'Permanently delete an alert.',
  })
  @ApiResponse({ status: 200, description: 'Alert deleted' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async deleteAlert(
    @Param('id') alertId: string,
    @Request() req: any,
  ): Promise<GeneralResponse<any>> {
    const userId = req.user.userId;
    await this.alertsService.deleteAlert(userId, alertId);
    return GeneralResponse.success({ message: 'Alert deleted successfully' });
  }
}
