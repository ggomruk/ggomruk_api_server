import { Test, TestingModule } from '@nestjs/testing';
import { BacktestService } from './backtest.service';
import { BacktestSchemaRepository } from './backtest.repository';
import RedisMessageQueueClient from '../../redis/messageQueue/redis.mq.client';
import { BacktestPubSubService } from '../../redis/messageQueue/backtest-pubsub.service';
import { WebsocketGateway } from '../../websocket/websocketGateway';
import { BacktestException } from './backtest.exception';

/**
 * Unit Tests for BacktestService
 * ------------------------------
 * Covers the core logic of initiating backtests and processing results.
 * Mocks all external dependencies: Database (Repository), Redis (PubSub), and Websocket.
 */
describe('BacktestService', () => {
  let service: BacktestService;
  let repository: BacktestSchemaRepository;
  let pubSub: BacktestPubSubService;
  let gateway: WebsocketGateway;

  // Mock Dependencies
  const mockRepository = {
    insertData: jest.fn(),
    findByUid: jest.fn(),
    upsertData: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
  };

  const mockRedisClient = {}; // If needed

  const mockPubSub = {
    publishTask: jest.fn(),
  };

  const mockGateway = {
    emitBacktestStarted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BacktestService,
        {
          provide: BacktestSchemaRepository,
          useValue: mockRepository,
        },
        {
          provide: RedisMessageQueueClient, // Used in constructor but maybe not in tested methods?
          useValue: mockRedisClient,
        },
        {
          provide: BacktestPubSubService,
          useValue: mockPubSub,
        },
        {
          provide: WebsocketGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<BacktestService>(BacktestService);
    repository = module.get<BacktestSchemaRepository>(BacktestSchemaRepository);
    pubSub = module.get<BacktestPubSubService>(BacktestPubSubService);
    gateway = module.get<WebsocketGateway>(WebsocketGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runBacktest', () => {
    const mockRequest: any = {
      symbol: 'BTCUSDT',
      interval: '1h',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      strategyName: 'MACD',
      strategyParams: { strategies: {} },
    };
    const userId = '123';

    it('should save backtest, publish task, and emit event', async () => {
      mockRepository.insertData.mockResolvedValue({});
      mockPubSub.publishTask.mockResolvedValue(true);

      const result = await service.runBacktest(mockRequest, userId);

      expect(result).toHaveProperty('backtestId');
      expect(result.status).toBe('pending');

      expect(mockRepository.insertData).toHaveBeenCalled();
      expect(mockPubSub.publishTask).toHaveBeenCalled();
      expect(mockGateway.emitBacktestStarted).toHaveBeenCalled();
    });

    it('should throw exception if save fails', async () => {
      mockRepository.insertData.mockRejectedValue(new Error('DB Error'));

      await expect(service.runBacktest(mockRequest, userId)).rejects.toThrow(
        BacktestException,
      );
    });
  });

  describe('checkAndUpdateResultIfUidExists', () => {
    const uid = 'test-uid';
    const resultData = { metrics: {} };

    it('should update document if result missing', async () => {
      // Mock existing document without result
      const doc = { uid, result: null };
      mockRepository.findByUid.mockResolvedValue(doc);
      mockRepository.upsertData.mockResolvedValue({
        ...doc,
        result: resultData,
      });

      const result = await service.checkAndUpdateResultIfUidExists(
        uid,
        resultData,
      );
      expect(repository.upsertData).toHaveBeenCalled();
    });

    it('should throw if document not found', async () => {
      mockRepository.findByUid.mockResolvedValue(null);
      await expect(
        service.checkAndUpdateResultIfUidExists(uid, resultData),
      ).rejects.toThrow(BacktestException);
    });
  });
});
