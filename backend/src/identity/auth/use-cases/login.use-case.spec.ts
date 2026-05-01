import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from '../../sessions/sessions.service';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: () => 'test-uuid-1234-5678',
}));

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let sessionsService: jest.Mocked<SessionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
            },
            profiles: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_ACCESS_SECRET: 'test-access-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            createSession: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    sessionsService = module.get(SessionsService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should login successfully and return response', async () => {
      const loginDto = { email: 'test@jasrapo.com', password: 'Password123!' };
      const mockUser = {
        usersId: 1,
        email: 'test@jasrapo.com',
        password: 'hashedPassword',
        deletedAt: null,
      };

      (prismaService.users.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // Initial validateUser
        .mockResolvedValueOnce({ // buildLoginResponse
          rolesId: 1,
          role: { name: 'ADMIN', deletedAt: null },
        });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      jwtService.decode
        .mockReturnValueOnce({ iat: 1000, exp: 2000 })
        .mockReturnValueOnce({ iat: 1000, exp: 2000 });

      prismaService.profiles.findUnique.mockResolvedValue({
        firstName: 'Test',
        lastName: 'User',
        avatar: { key: 'avatar-key' },
      } as any);

      sessionsService.createSession.mockResolvedValue({} as any);

      const result = await useCase.execute(loginDto, '127.0.0.1', 'Chrome');

      expect(result).toMatchObject({
        sub: 1,
        email: 'test@jasrapo.com',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(sessionsService.createSession).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        useCase.execute({ email: 'notfound@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password invalid', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue({
        usersId: 1,
        email: 'test@test.com',
        password: 'hashed',
        deletedAt: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException when session creation fails', async () => {
      (prismaService.users.findUnique as jest.Mock).mockResolvedValue({
        usersId: 1,
        email: 'test@test.com',
        password: 'hashed',
        deletedAt: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
      
      sessionsService.createSession.mockRejectedValue(new Error('DB Error'));

      await expect(
        useCase.execute({ email: 'test@test.com', password: 'pass' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
