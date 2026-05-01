import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RegisterUseCase } from './register.use-case';
import { UserService } from 'src/identity/users/user.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: UserService,
          useValue: {
            user: jest.fn(),
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should register a new user', async () => {
      userService.user.mockResolvedValue(null);
      userService.createUser.mockResolvedValue({ usersId: 1 } as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      const result = await useCase.execute({
        email: 'test@test.com',
        password: 'pass',
      });

      expect(result).toBe('El registro fue exitoso');
      expect(userService.createUser).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user exists', async () => {
      userService.user.mockResolvedValue({ usersId: 1 } as any);
      await expect(
        useCase.execute({ email: 'test@test.com', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if creation fails', async () => {
      userService.user.mockResolvedValue(null);
      userService.createUser.mockResolvedValue(null);
      await expect(
        useCase.execute({ email: 'test@test.com', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
