import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  WhaleTransaction,
  WhaleTransactionDocument,
  WhaleWallet,
  WhaleWalletDocument,
  UserWatchlist,
  UserWatchlistDocument,
  ExchangeFlow,
  ExchangeFlowDocument,
  BlockchainType,
  TransactionDirection,
} from './schemas';
import {
  AddWatchlistDto,
  UpdateWatchlistDto,
  GetTransactionsQueryDto,
  GetExchangeFlowQueryDto,
} from './dto';

// Free tier: 7 days, Premium: 90 days
const FREE_TIER_DAYS = 7;
const PREMIUM_TIER_DAYS = 90;
const MAX_FREE_WATCHLIST = 5;
const MAX_PREMIUM_WATCHLIST = 50;

@Injectable()
export class OnchainService {
  private readonly logger = new Logger(OnchainService.name);

  constructor(
    @InjectModel(WhaleTransaction.name)
    private whaleTransactionModel: Model<WhaleTransactionDocument>,
    @InjectModel(WhaleWallet.name)
    private whaleWalletModel: Model<WhaleWalletDocument>,
    @InjectModel(UserWatchlist.name)
    private userWatchlistModel: Model<UserWatchlistDocument>,
    @InjectModel(ExchangeFlow.name)
    private exchangeFlowModel: Model<ExchangeFlowDocument>,
  ) {}

  /**
   * Get whale transactions with filtering and pagination
   */
  async getTransactions(
    query: GetTransactionsQueryDto,
    isPremium: boolean = false,
  ) {
    const {
      blockchain,
      minAmountUsd,
      maxAmountUsd,
      direction,
      address,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    // Apply data retention limit
    const retentionDays = isPremium ? PREMIUM_TIER_DAYS : FREE_TIER_DAYS;
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);

    const filter: any = {
      timestamp: { $gte: retentionDate },
    };

    if (blockchain) filter.blockchain = blockchain;
    if (direction) filter.direction = direction;
    if (minAmountUsd) filter.amountUsd = { $gte: minAmountUsd };
    if (maxAmountUsd) {
      filter.amountUsd = { ...filter.amountUsd, $lte: maxAmountUsd };
    }
    if (address) {
      filter.$or = [{ fromAddress: address }, { toAddress: address }];
    }
    if (startDate) {
      const start = new Date(startDate);
      if (start > retentionDate) {
        filter.timestamp.$gte = start;
      }
    }
    if (endDate) {
      filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.whaleTransactionModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.whaleTransactionModel.countDocuments(filter),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific transaction by hash
   */
  async getTransactionByHash(txHash: string) {
    const transaction = await this.whaleTransactionModel
      .findOne({ txHash })
      .lean()
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction ${txHash} not found`);
    }

    return transaction;
  }

  /**
   * Get wallet details
   */
  async getWallet(address: string, blockchain?: BlockchainType) {
    const filter: any = { address };
    if (blockchain) filter.blockchain = blockchain;

    const wallet = await this.whaleWalletModel.findOne(filter).lean().exec();

    if (!wallet) {
      throw new NotFoundException(`Wallet ${address} not found`);
    }

    return wallet;
  }

  /**
   * Get known whale wallets (exchange wallets, large holders)
   */
  async getKnownWallets(blockchain?: BlockchainType) {
    const filter: any = { isKnownAddress: true };
    if (blockchain) filter.blockchain = blockchain;

    return this.whaleWalletModel
      .find(filter)
      .sort({ balance: -1 })
      .limit(100)
      .lean()
      .exec();
  }

  /**
   * Get exchange flow data
   */
  async getExchangeFlows(query: GetExchangeFlowQueryDto) {
    const { exchange = 'binance', blockchain, symbol, hours = 24 } = query;

    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    const filter: any = {
      exchange,
      timestamp: { $gte: startTime },
    };

    if (blockchain) filter.blockchain = blockchain;
    if (symbol) filter.symbol = symbol;

    const flows = await this.exchangeFlowModel
      .find(filter)
      .sort({ timestamp: -1 })
      .lean()
      .exec();

    // Calculate aggregated stats
    const stats = flows.reduce(
      (acc, flow) => {
        acc.totalInflowUsd += flow.inflowUsd;
        acc.totalOutflowUsd += flow.outflowUsd;
        acc.totalNetFlowUsd += flow.netFlowUsd;
        acc.inflowCount += flow.inflowCount;
        acc.outflowCount += flow.outflowCount;
        return acc;
      },
      {
        totalInflowUsd: 0,
        totalOutflowUsd: 0,
        totalNetFlowUsd: 0,
        inflowCount: 0,
        outflowCount: 0,
      },
    );

    return {
      exchange,
      period: `${hours}h`,
      stats,
      hourlyData: flows,
    };
  }

  /**
   * Get user's watchlist
   */
  async getUserWatchlist(userId: string) {
    return this.userWatchlistModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Add address to watchlist
   */
  async addToWatchlist(
    userId: string,
    dto: AddWatchlistDto,
    isPremium: boolean = false,
  ) {
    const userObjectId = new Types.ObjectId(userId);

    // Check watchlist limit
    const currentCount = await this.userWatchlistModel.countDocuments({
      userId: userObjectId,
    });
    const maxLimit = isPremium ? MAX_PREMIUM_WATCHLIST : MAX_FREE_WATCHLIST;

    if (currentCount >= maxLimit) {
      throw new ForbiddenException(
        `Watchlist limit reached (${maxLimit}). ${isPremium ? 'Contact support.' : 'Upgrade to premium for more.'}`,
      );
    }

    // Check if already exists
    const existing = await this.userWatchlistModel.findOne({
      userId: userObjectId,
      address: dto.address,
      blockchain: dto.blockchain,
    });

    if (existing) {
      throw new ConflictException('Address already in watchlist');
    }

    // Try to get label from known wallets
    const knownWallet = await this.whaleWalletModel.findOne({
      address: dto.address,
      blockchain: dto.blockchain,
    });

    const watchlist = new this.userWatchlistModel({
      userId: userObjectId,
      ...dto,
      label: knownWallet?.label,
    });

    await watchlist.save();
    this.logger.log(`User ${userId} added ${dto.address} to watchlist`);

    return watchlist;
  }

  /**
   * Update watchlist entry
   */
  async updateWatchlist(
    userId: string,
    watchlistId: string,
    dto: UpdateWatchlistDto,
  ) {
    const watchlist = await this.userWatchlistModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(watchlistId),
        userId: new Types.ObjectId(userId),
      },
      { $set: dto },
      { new: true },
    );

    if (!watchlist) {
      throw new NotFoundException('Watchlist entry not found');
    }

    return watchlist;
  }

  /**
   * Remove from watchlist
   */
  async removeFromWatchlist(userId: string, watchlistId: string) {
    const result = await this.userWatchlistModel.deleteOne({
      _id: new Types.ObjectId(watchlistId),
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Watchlist entry not found');
    }

    return { deleted: true };
  }

  /**
   * Get transaction history for a specific address
   */
  async getAddressHistory(
    address: string,
    blockchain: BlockchainType,
    isPremium: boolean = false,
    limit: number = 50,
  ) {
    const retentionDays = isPremium ? PREMIUM_TIER_DAYS : FREE_TIER_DAYS;
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);

    return this.whaleTransactionModel
      .find({
        $or: [{ fromAddress: address }, { toAddress: address }],
        blockchain,
        timestamp: { $gte: retentionDate },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Get latest transactions (for real-time feed)
   */
  async getLatestTransactions(limit: number = 20) {
    return this.whaleTransactionModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Get summary statistics
   */
  async getStats(hours: number = 24) {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    const [transactionStats, exchangeFlowStats] = await Promise.all([
      this.whaleTransactionModel.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        {
          $group: {
            _id: '$blockchain',
            count: { $sum: 1 },
            totalUsd: { $sum: '$amountUsd' },
            avgUsd: { $avg: '$amountUsd' },
            maxUsd: { $max: '$amountUsd' },
          },
        },
      ]),
      this.exchangeFlowModel.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        {
          $group: {
            _id: '$exchange',
            totalInflowUsd: { $sum: '$inflowUsd' },
            totalOutflowUsd: { $sum: '$outflowUsd' },
            netFlowUsd: { $sum: '$netFlowUsd' },
          },
        },
      ]),
    ]);

    return {
      period: `${hours}h`,
      transactions: transactionStats,
      exchangeFlows: exchangeFlowStats,
    };
  }
}
