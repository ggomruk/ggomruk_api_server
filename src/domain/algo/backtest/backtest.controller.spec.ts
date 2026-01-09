import { Test, TestingModule } from '@nestjs/testing';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

/**
 * Unit Tests for BacktestController
 * ---------------------------------
 * Validates request handling for backtest operations.
 */
describe('BacktestController', () => {
  let controller: BacktestController;
  let service: BacktestService;

  const mockService = {
    runBacktest: jest.fn(),
    getBacktestHistory: jest.fn(),
    getBacktestResult: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacktestController],
      providers: [
        {
          provide: BacktestService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BacktestController>(BacktestController);
    service = module.get<BacktestService>(BacktestService);
  });

  describe('runBacktest', () => {
    it('should call service and return success response', async () => {
      const req = { user: { userId: '123' } };
      const body = { symbol: 'BTC' } as any;
      const serviceResult = { backtestId: 'abc' };

      mockService.runBacktest.mockResolvedValue(serviceResult);

      const result = await controller.runBacktest(body, req);

      expect(service.runBacktest).toHaveBeenCalledWith(body, '123');
      expect(result.isOk).toBe(true);
      expect(result.payload).toBe(serviceResult);
    });
  });

  describe('getHistory', () => {
    it('should return user history', async () => {
      const req = { user: { userId: '123' } };
      mockService.getBacktestHistory.mockResolvedValue([]);

      const result = await controller.getHistory(req);
      expect(service.getBacktestHistory).toHaveBeenCalledWith('123');
      expect(result.isOk).toBe(true);
    });
  });
});
