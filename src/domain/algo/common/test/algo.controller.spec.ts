import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  ValidationPipe,
} from '@nestjs/common';
import { validBacktestBody, invalidBacktestBody } from './stub/backtest.stub';
import { AlgoController } from '../../algo.controller';
import { AlgoExceptionCode } from '../../algo.exception';
import { AlgoService } from '../../algo.service';
import request from 'supertest';
import { JwtAuthGuard } from '../../../../domain/auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from '../../../../common/filters/all-exceptions.filter';

describe('Algo Controller', () => {
  let app: INestApplication;
  let algoService: AlgoService;
  let algoController: AlgoController;

  const mockAlgoService = {
    runBacktest: jest.fn().mockResolvedValue('mock-backtest-id'),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'test-user-id' };
      return true;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlgoController],
      providers: [
        {
          provide: AlgoService,
          useValue: mockAlgoService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    algoService = module.get<AlgoService>(AlgoService);
    algoController = module.get<AlgoController>(AlgoController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/algo/backtest')
      .send(validBacktestBody);

    expect(response.status).toBe(201);
  });

  it('should return 400 with error code 2001', async () => {
    const response = await request(app.getHttpServer())
      .post('/algo/backtest')
      .send(invalidBacktestBody)
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe(
      AlgoExceptionCode.INVALID_INTPUT_PARAMETER,
    );
  });
});
