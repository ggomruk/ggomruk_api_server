import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnchainController } from './onchain.controller';
import { OnchainService } from './onchain.service';
import {
  WhaleTransaction,
  WhaleTransactionSchema,
  WhaleWallet,
  WhaleWalletSchema,
  UserWatchlist,
  UserWatchlistSchema,
  ExchangeFlow,
  ExchangeFlowSchema,
} from './schemas';

/**
 * 🐋 OnchainModule - On-Chain Analysis & Whale Tracking
 *
 * @description Provides whale transaction tracking, exchange flow analysis,
 * and user watchlist functionality for tracking large crypto movements.
 *
 * @features
 * - Real-time whale transaction feed
 * - Exchange inflow/outflow tracking (Binance focus)
 * - User watchlist for custom address tracking
 * - Known wallet labeling
 *
 * @collections
 * - whale_transactions: Large transactions (>$500K)
 * - whale_wallets: Known wallet addresses with labels
 * - user_watchlists: User-tracked addresses
 * - exchange_flows: Hourly aggregated exchange flow data
 *
 * @premium
 * - Free: 7 days history, 5 watchlist addresses
 * - Premium: 90 days history, 50 watchlist addresses
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WhaleTransaction.name, schema: WhaleTransactionSchema },
      { name: WhaleWallet.name, schema: WhaleWalletSchema },
      { name: UserWatchlist.name, schema: UserWatchlistSchema },
      { name: ExchangeFlow.name, schema: ExchangeFlowSchema },
    ]),
  ],
  controllers: [OnchainController],
  providers: [OnchainService],
  exports: [OnchainService],
})
export class OnchainModule {}
