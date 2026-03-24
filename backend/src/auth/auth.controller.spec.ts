import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({
              accessToken: 'token',
              user: { usersId: 1 },
            }),
            login: jest.fn().mockResolvedValue({
              accessToken: 'token',
              refreshToken: 'refresh',
              user: { usersId: 1 },
            }),
            refreshAccessToken: jest.fn().mockResolvedValue({
              accessToken: 'newToken',
              refreshToken: 'newRefresh',
            }),
            logout: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
