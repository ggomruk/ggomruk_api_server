import { Test, TestingModule } from '@nestjs/testing';
import { OptimizerService } from './optimizer.service';
import { BacktestService } from '../backtest/backtest.service';
import { BacktestPubSubService } from 'src/domain/redis/messageQueue/backtest-pubsub.service';
import { OptimizationTaskService } from './service/optimizationTask.service';
import { OptimizationResultService } from './service/optimizationResult.service';
import { OptimizeStrategyDTO } from './dto/optimize-strategy.dto';

describe('OptimizerService', () => {
  let service: OptimizerService;
  let backtestService: BacktestService;
  let pubSubService: BacktestPubSubService;
  let taskService: OptimizationTaskService;
  let resultService: OptimizationResultService;

  const mockBacktestService = {
    getBacktestById: jest.fn(),
  };

  const mockPubSubService = {
    onOptimizationComplete: jest.fn(),
    publishOptimizationTask: jest.fn(),
  };

  const mockTaskService = {
    createOptimizationTask: jest.fn(),
    updateOptimizationStatus: jest.fn(),
    getOptimizationTask: jest.fn(),
    getUserOptimizationTasks: jest.fn(),
  };

  const mockResultService = {
    getOptimizationResult: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OptimizerService,
        { provide: BacktestService, useValue: mockBacktestService },
        { provide: BacktestPubSubService, useValue: mockPubSubService },
        { provide: OptimizationTaskService, useValue: mockTaskService },
        { provide: OptimizationResultService, useValue: mockResultService },
      ],
    }).compile();

    service = module.get<OptimizerService>(OptimizerService);
    backtestService = module.get<BacktestService>(BacktestService);
    pubSubService = module.get<BacktestPubSubService>(BacktestPubSubService);
    taskService = module.get<OptimizationTaskService>(OptimizationTaskService);
    resultService = module.get<OptimizationResultService>(
      OptimizationResultService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('optimizeStrategy', () => {
    const dto: OptimizeStrategyDTO = {
      symbol: 'BTCUSDT',
      interval: '1h',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      strategies: ['RSI'],
      metric: 'sharpe' as const,
      paramRanges: [{ name: 'period', min: 10, max: 20, step: 2 }],
    };
    const userId = 'user-1';

    it('should create task and publish to redis', async () => {
      mockTaskService.createOptimizationTask.mockResolvedValue({});
      mockPubSubService.publishOptimizationTask.mockResolvedValue({});

      const result = await service.optimizeStrategy(dto, userId);

      expect(mockTaskService.createOptimizationTask).toHaveBeenCalled();
      expect(mockPubSubService.publishOptimizationTask).toHaveBeenCalled();
      expect(result).toHaveProperty('optimizationId');
    });

    it('should handle redis publish error', async () => {
      mockTaskService.createOptimizationTask.mockResolvedValue({});
      mockPubSubService.publishOptimizationTask.mockRejectedValue(
        new Error('Redis Error'),
      );

      await expect(service.optimizeStrategy(dto, userId)).rejects.toThrow(
        'Redis Error',
      );
      expect(mockTaskService.updateOptimizationStatus).toHaveBeenCalledWith(
        expect.any(String),
        'failed',
        undefined,
        'Redis Error',
      );
    });
  });

  describe('getOptimizationStatus', () => {
    it('should return null if task not found', async () => {
      mockTaskService.getOptimizationTask.mockResolvedValue(null);
      const result = await service.getOptimizationStatus('opt-1');
      expect(result).toBeNull();
    });

    it('should return task without result if running', async () => {
      mockTaskService.getOptimizationTask.mockResolvedValue({
        optimizationId: 'opt-1',
        status: 'running',
        params: {},
      });

      const result = await service.getOptimizationStatus('opt-1');
      expect(result.status).toBe('running');
      expect(result.result).toBeNull();
    });

    it('should return task with result if completed', async () => {
      mockTaskService.getOptimizationTask.mockResolvedValue({
        optimizationId: 'opt-1',
        status: 'completed',
        resultId: 'res-1',
        params: {},
      });
      mockResultService.getOptimizationResult.mockResolvedValue({
        data: 'result',
      });

      const result = await service.getOptimizationStatus('opt-1');
      expect(result.status).toBe('completed');
      expect(result.result).toEqual({ data: 'result' });
    });
  });

  describe('compareStrategies', () => {
    it('should return comparison data', async () => {
      const backtestStub = {
        _id: 'bt-1',
        backtestParams: {},
        result: {
          leveragedPerformance: { totalReturn: 10 },
          performance: { winRate: 0.6 },
        },
      };
      mockBacktestService.getBacktestById.mockResolvedValue(backtestStub);

      const result = await service.compareStrategies({ backtestIds: ['bt-1'] });
      expect(result.comparison).toHaveLength(1);
      expect(result.comparison[0].metrics.total_return).toBe(10);
    });
  });
});
