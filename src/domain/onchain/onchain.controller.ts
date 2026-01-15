import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnchainService } from './onchain.service';
import {
  AddWatchlistDto,
  UpdateWatchlistDto,
  GetTransactionsQueryDto,
  GetExchangeFlowQueryDto,
  GetWalletQueryDto,
} from './dto';
import { BlockchainType } from './schemas';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

@ApiTags('onchain')
@Controller('onchain')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OnchainController {
  constructor(private readonly onchainService: OnchainService) {}

  // ==================== TRANSACTIONS ====================

  @Get('transactions')
  @ApiOperation({
    summary: 'Get whale transactions',
    description:
      'Retrieve whale transactions with filtering. Free tier: 7 days history, Premium: 90 days.',
  })
  @ApiResponse({ status: 200, description: 'Transactions retrieved' })
  async getTransactions(
    @Query() query: GetTransactionsQueryDto,
    @Request() req,
  ) {
    const isPremium = req.user?.subscription === 'premium';
    const result = await this.onchainService.getTransactions(query, isPremium);
    return GeneralResponse.success(result, 'Transactions retrieved');
  }

  @Get('transactions/latest')
  @ApiOperation({
    summary: 'Get latest transactions',
    description: 'Get the most recent whale transactions for real-time feed',
  })
  async getLatestTransactions(@Query('limit') limit: number = 20) {
    const transactions = await this.onchainService.getLatestTransactions(
      Math.min(limit, 50),
    );
    return GeneralResponse.success(transactions, 'Latest transactions');
  }

  @Get('transactions/:txHash')
  @ApiOperation({ summary: 'Get transaction by hash' })
  @ApiParam({ name: 'txHash', description: 'Transaction hash' })
  async getTransactionByHash(@Param('txHash') txHash: string) {
    const transaction = await this.onchainService.getTransactionByHash(txHash);
    return GeneralResponse.success(transaction, 'Transaction found');
  }

  // ==================== WALLETS ====================

  @Get('wallets/known')
  @ApiOperation({
    summary: 'Get known whale wallets',
    description: 'List known exchange wallets and major holders',
  })
  async getKnownWallets(@Query() query: GetWalletQueryDto) {
    const wallets = await this.onchainService.getKnownWallets(query.blockchain);
    return GeneralResponse.success(wallets, 'Known wallets retrieved');
  }

  @Get('wallets/:address')
  @ApiOperation({ summary: 'Get wallet details' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  async getWallet(
    @Param('address') address: string,
    @Query() query: GetWalletQueryDto,
  ) {
    const wallet = await this.onchainService.getWallet(
      address,
      query.blockchain,
    );
    return GeneralResponse.success(wallet, 'Wallet found');
  }

  @Get('wallets/:address/history')
  @ApiOperation({
    summary: 'Get transaction history for an address',
    description: 'Retrieve transaction history for a specific wallet address',
  })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  async getAddressHistory(
    @Param('address') address: string,
    @Query('blockchain') blockchain: BlockchainType,
    @Query('limit') limit: number = 50,
    @Request() req,
  ) {
    const isPremium = req.user?.subscription === 'premium';
    const history = await this.onchainService.getAddressHistory(
      address,
      blockchain,
      isPremium,
      Math.min(limit, 100),
    );
    return GeneralResponse.success(history, 'Address history retrieved');
  }

  // ==================== EXCHANGE FLOWS ====================

  @Get('exchange-flows')
  @ApiOperation({
    summary: 'Get exchange flow data',
    description:
      'Get inflow/outflow data for exchanges. Useful for detecting sell/buy pressure.',
  })
  async getExchangeFlows(@Query() query: GetExchangeFlowQueryDto) {
    const flows = await this.onchainService.getExchangeFlows(query);
    return GeneralResponse.success(flows, 'Exchange flows retrieved');
  }

  // ==================== WATCHLIST ====================

  @Get('watchlist')
  @ApiOperation({
    summary: 'Get user watchlist',
    description: 'Retrieve addresses the user is tracking',
  })
  async getWatchlist(@Request() req) {
    const watchlist = await this.onchainService.getUserWatchlist(req.user.sub);
    return GeneralResponse.success(watchlist, 'Watchlist retrieved');
  }

  @Post('watchlist')
  @ApiOperation({
    summary: 'Add address to watchlist',
    description:
      'Add a wallet address to track. Free: 5 addresses, Premium: 50 addresses.',
  })
  async addToWatchlist(@Request() req, @Body() dto: AddWatchlistDto) {
    const isPremium = req.user?.subscription === 'premium';
    const entry = await this.onchainService.addToWatchlist(
      req.user.sub,
      dto,
      isPremium,
    );
    return GeneralResponse.success(entry, 'Address added to watchlist');
  }

  @Patch('watchlist/:id')
  @ApiOperation({ summary: 'Update watchlist entry' })
  @ApiParam({ name: 'id', description: 'Watchlist entry ID' })
  async updateWatchlist(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateWatchlistDto,
  ) {
    const entry = await this.onchainService.updateWatchlist(
      req.user.sub,
      id,
      dto,
    );
    return GeneralResponse.success(entry, 'Watchlist updated');
  }

  @Delete('watchlist/:id')
  @ApiOperation({ summary: 'Remove from watchlist' })
  @ApiParam({ name: 'id', description: 'Watchlist entry ID' })
  async removeFromWatchlist(@Request() req, @Param('id') id: string) {
    await this.onchainService.removeFromWatchlist(req.user.sub, id);
    return GeneralResponse.success(null, 'Removed from watchlist');
  }

  // ==================== STATS ====================

  @Get('stats')
  @ApiOperation({
    summary: 'Get on-chain statistics',
    description: 'Get aggregated statistics for whale transactions',
  })
  async getStats(@Query('hours') hours: number = 24) {
    const stats = await this.onchainService.getStats(Math.min(hours, 168)); // Max 7 days
    return GeneralResponse.success(stats, 'Stats retrieved');
  }
}
