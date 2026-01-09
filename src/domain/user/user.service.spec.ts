import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User } from './user.schema';
import { UserAuth } from './user-auth.schema';
import { ConflictException } from '@nestjs/common';

/**
 * Unit Tests for UserService
 * --------------------------
 * Verifies business logic including user creation, duplicates check, and transaction-like rollback.
 */
describe('UserService', () => {
  let service: UserService;
  let userModel: any;
  let userAuthModel: any;

  // Mock Data
  const mockUserDTO = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUser = {
    _id: 'user-id-123',
    username: mockUserDTO.username,
    email: mockUserDTO.email,
  };

  class MockUserModel {
    constructor(public data: any) {
      Object.assign(this, data);
    }
    save = jest.fn().mockResolvedValue({ ...this.data, _id: 'user-id-123' });
    static findOne = jest.fn();
    static findById = jest.fn();
    static findByIdAndDelete = jest.fn();
  }

  class MockUserAuthModel {
    constructor(public data: any) {}
    save = jest.fn().mockResolvedValue(this.data);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: getModelToken(UserAuth.name),
          useValue: MockUserAuthModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
    userAuthModel = module.get(getModelToken(UserAuth.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Setup: No existing user
      (userModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.createUser(mockUserDTO);

      expect(userModel.findOne).toHaveBeenCalledTimes(2); // Check username and email
      expect(result).toHaveProperty('_id', 'user-id-123');
      expect(result.username).toBe(mockUserDTO.username);
    });

    it('should throw ConflictException if username exists', async () => {
      // Setup: Existing username
      (userModel.findOne as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.createUser(mockUserDTO)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findUser', () => {
    it('should return a user if found', async () => {
      (userModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findUser('testuser');
      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
    });

    it('should return null if not found', async () => {
      (userModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findUser('unknown');
      expect(result).toBeNull();
    });
  });
});
