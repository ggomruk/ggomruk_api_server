import { Test, TestingModule } from '@nestjs/testing';
import { OptimizerController } from './optimizer.controller';
import { OptimizerService } from './optimizer.service';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

describe('OptimizerController', () => {
  let controller: OptimizerController;
  let service: OptimizerService;

  const mockService = {
    optimizeStrategy: jest.fn(),
    getOptimizationStatus: jest.fn(),
    getUserOptimizations: jest.fn(),
    compareStrategies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OptimizerController],
      providers: [
        {
          provide: OptimizerService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OptimizerController>(OptimizerController);
    service = module.get<OptimizerService>(OptimizerService);
  });

  describe('optimizeStrategy', () => {
    it('should call service and return success response', async () => {
      const dto: any = { strategyName: 'Test' };
      const req = { user: { userId: '123' } };
      mockService.optimizeStrategy.mockResolvedValue({
        optimizationId: 'opt-1',
      });

      const result = await controller.optimizeStrategy(dto, req);
      expect(service.optimizeStrategy).toHaveBeenCalledWith(dto, '123');
      expect(result.isOk).toBe(true);
      expect(result.payload).toEqual({ optimizationId: 'opt-1' });
    });
  });

  describe('getOptimizationStatus', () => {
    it('should return status', async () => {
      mockService.getOptimizationStatus.mockResolvedValue({
        status: 'running',
      });
      const result = await controller.getOptimizationStatus('opt-1');
      expect(result.payload.status).toBe('running');
    });

    it('should throw if not found', async () => {
      mockService.getOptimizationStatus.mockResolvedValue(null);
      await expect(controller.getOptimizationStatus('opt-1')).rejects.toThrow();
    });
  });
});
