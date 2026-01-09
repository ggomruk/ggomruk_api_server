import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/domain/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

/**
 * Unit Tests for AuthService
 * --------------------------
 * Validates authentication flows: login, tokens generation, and signup.
 */
describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserResult = {
    _id: '123',
    username: 'test',
    email: 'test@test.com',
    toObject: jest.fn().mockReturnValue({
      _id: '123',
      username: 'test',
      email: 'test@test.com',
    }),
  };

  const mockUserService = {
    findUser: jest.fn(),
    validatePassword: jest.fn(),
    createUser: jest.fn(),
    createOrUpdateGoogleUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'auth.jwtRefreshSecret') return 'refresh_secret';
      if (key === 'auth.jwtRefreshExpiresIn') return '7d';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data if validation succeeds', async () => {
      mockUserService.findUser.mockResolvedValue(mockUserResult);
      mockUserService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('test', 'pass');
      expect(result).toEqual(expect.objectContaining({ username: 'test' }));
    });

    it('should return null if user not found', async () => {
      mockUserService.findUser.mockResolvedValue(null);
      const result = await service.validateUser('test', 'pass');
      expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
      mockUserService.findUser.mockResolvedValue(mockUserResult);
      mockUserService.validatePassword.mockResolvedValue(false);
      const result = await service.validateUser('test', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and user info', async () => {
      const user = { _id: '123', username: 'test', email: 'test@test.com' };
      const result = await service.login(user);

      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result).toHaveProperty('refresh_token', 'mock-token');
      expect(result.user.username).toBe('test');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
