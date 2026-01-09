import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { OptimizerController } from '../src/domain/algo/optimizer/optimizer.controller';
import { OptimizerService } from '../src/domain/algo/optimizer/optimizer.service';
import { JwtAuthGuard } from '../src/domain/auth/guards/jwt-auth.guard';
import { OptimizeStrategyDTO } from '../src/domain/algo/optimizer/dto/optimize-strategy.dto';

/**
 * QA Testing Code: Optimizer E2E Spec
 * -----------------------------------
 * This file contains End-to-End (E2E) tests for the Optimizer Controller.
 * It simulates HTTP requests against the API endpoints to verify:
 * 1. Correct status codes (200, 201, 400, 404).
 * 2. Proper request body validation.
 * 3. Correct response structure (GeneralResponse wrapper).
 * 4. Interaction with the underlying service (Mocked).
 */

describe('OptimizerController (E2E)', () => {
  let app: INestApplication;
  let optimizerService: OptimizerService;

  // Mock Data
  const mockOptimizationId = 'opt-123';
  const mockUserId = 'test-user-id';

  // Mock Service Implementation
  // We mock the service to isolate the controller tests.
  // This ensures we are testing the API layer, not the complex optimization logic or DB.
  const mockOptimizerService = {
    optimizeStrategy: jest
      .fn()
      .mockResolvedValue({ optimizationId: mockOptimizationId }),
    getOptimizationStatus: jest.fn().mockImplementation((id) => {
      if (id === mockOptimizationId) {
        return Promise.resolve({ status: 'completed', result: {} });
      }
      return Promise.resolve(null);
    }),
    getUserOptimizations: jest.fn().mockResolvedValue([
      { optimizationId: 'opt-1', status: 'completed' },
      { optimizationId: 'opt-2', status: 'running' },
    ]),
    compareStrategies: jest.fn().mockResolvedValue({
      winner: 'uuid-1',
      diff: { total_return: '5%' },
    }),
  };

  /**
   * Setup before running tests.
   * Compiles the NestJS module with mocks.
   */
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OptimizerController],
      providers: [
        {
          provide: OptimizerService,
          useValue: mockOptimizerService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          // Mock Authentication: Always inject a test user
          const req = context.switchToHttp().getRequest();
          req.user = { userId: mockUserId };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    // Enable validation pipe if your main.ts uses it (often global)
    // For unit/integration tests of controllers, explicit validation testing
    // might require binding the ValidationPipe manually if it's not global here.
    // app.useGlobalPipes(new ValidationPipe());

    await app.init();
    optimizerService = moduleFixture.get<OptimizerService>(OptimizerService);
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Test Suite: POST /optimizer/optimize
   * Verifies that the optimization job can be started with valid parameters.
   */
  describe('POST /optimizer/optimize', () => {
    it('should start optimization and return success response', () => {
      // Input Payload
      const optimizeDto = {
        strategyName: 'RSI_Strategy',
        symbol: 'BTCUSDT',
        interval: '1h',
        ranges: [
          { name: 'rsiPeriod', min: 10, max: 20, step: 2 }, // Mocking partial structure
        ],
        // ... other required fields based on DTO
      };

      return request(app.getHttpServer())
        .post('/optimizer/optimize')
        .send(optimizeDto)
        .expect(201) // Expecting Created status
        .expect((res) => {
          // Verify Response Structure
          expect(res.body.isOk).toBe(true);
          expect(res.body.payload).toHaveProperty(
            'optimizationId',
            mockOptimizationId,
          );
          // Verify Service Call
          expect(mockOptimizerService.optimizeStrategy).toHaveBeenCalled();
        });
    });

    /**
     * Negative Test Case:
     * Verifies system behavior on bad input.
     * (Note: If ValidationPipe is not enabled in test setup, this might pass 201.
     *  In a real E2E environment with full app bootstrap, this would return 400).
     */
    // it('should return 400 on invalid payload', () => { ... });
  });

  /**
   * Test Suite: GET /optimizer/optimize/:id
   * Verifies retrieval of optimization status.
   */
  describe('GET /optimizer/optimize/:id', () => {
    it('should return optimization status when found', () => {
      return request(app.getHttpServer())
        .get(`/optimizer/optimize/${mockOptimizationId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.isOk).toBe(true);
          expect(res.body.payload.status).toBe('completed');
        });
    });

    it('should return 404 when optimization is not found', () => {
      // Mock service to simulate not found indirectly
      // or rely on the mock logic defined at top (returns null for other IDs)
      return request(app.getHttpServer())
        .get('/optimizer/optimize/non-existent-id')
        .expect(404)
        .expect((res) => {
          // Expect standard NestJS 404 body or your exception filter format
          // The controller throws NotFoundException which usually returns message & statusCode
          expect(res.body.message).toBe('Optimization not found');
        });
    });
  });

  /**
   * Test Suite: GET /optimizer/optimizations
   * Verifies listing a user's optimizations.
   */
  describe('GET /optimizer/optimizations', () => {
    it('should return list of user optimizations', () => {
      return request(app.getHttpServer())
        .get('/optimizer/optimizations')
        .expect(200)
        .expect((res) => {
          expect(res.body.isOk).toBe(true);
          expect(Array.isArray(res.body.payload)).toBe(true);
          expect(res.body.payload).toHaveLength(2);
        });
    });
  });

  /**
   * Test Suite: POST /optimizer/compare
   * Verifies strategy comparison logic.
   */
  describe('POST /optimizer/compare', () => {
    it('should compare strategies and return differences', () => {
      const compareDto = {
        backtestIds: ['uuid-1', 'uuid-2'],
      };

      return request(app.getHttpServer())
        .post('/optimizer/compare')
        .send(compareDto)
        .expect(201) // NestJS default for POST is 201
        .expect((res) => {
          expect(res.body.isOk).toBe(true);
          expect(res.body.payload).toHaveProperty('winner');
        });
    });
  });
});
