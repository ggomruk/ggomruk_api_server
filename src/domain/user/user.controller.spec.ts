import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserDTO } from './dto/user.dto';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

/**
 * Unit Tests for UserController
 * -----------------------------
 * Verifies the interactions between the controller and the service.
 * Ensures that DTOs are passed correctly and responses are formatted standardly.
 */
describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  // Mock Service
  const mockUserService = {
    createUser: jest.fn(),
  };

  const mockUserDTO: UserDTO = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password',
  };

  const mockUser = {
    _id: '123',
    ...mockUserDTO,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and return GeneralResponse', async () => {
      // Mock successful creation
      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(mockUserDTO);

      expect(userService.createUser).toHaveBeenCalledWith(mockUserDTO);
      expect(result).toBeInstanceOf(Object);
      expect(result.isOk).toBe(true);
      expect(result.payload).toEqual(mockUser);
    });

    it('should handle errors thrown by service', async () => {
      mockUserService.createUser.mockRejectedValue(
        new Error('Validation error'),
      );

      await expect(controller.createUser(mockUserDTO)).rejects.toThrow(
        'Validation error',
      );
    });
  });
});
