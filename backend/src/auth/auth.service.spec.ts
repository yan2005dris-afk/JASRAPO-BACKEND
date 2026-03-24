import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/modules/user/user.service';
import { PrismaService } from 'src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisSessionService } from 'src/redis/redis-session.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: () => 'test-uuid-1234-5678',
}));

describe('AuthService', () => {
  let service: AuthService;
  let redisSessionService: jest.Mocked<RedisSessionService>;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getEffectivePermissions: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
              create: jest.fn(),
            } as any,
            profiles: { findUnique: jest.fn() } as any,
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
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_ACCESS_SECRET: 'test-access-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
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
          provide: RedisSessionService,
          useValue: {
            setSession: jest.fn(),
            getSession: jest.fn(),
            delSession: jest.fn(),
            listSessionsByUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    redisSessionService = module.get(RedisSessionService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      prismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        email: 'test@jasrapo.com',
        password: 'hashedPassword',
        deletedAt: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser({
        email: 'test@jasrapo.com',
        password: 'Password123!',
      });

      expect(result).toMatchObject({ usersId: 1, email: 'test@jasrapo.com' });
    });

    it('should throw with incorrect password', async () => {
      prismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        email: 'test@jasrapo.com',
        password: 'hashedPassword',
        deletedAt: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser({ email: 'test@jasrapo.com', password: 'Wrong!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when user not found', async () => {
      prismaService.users.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser({
          email: 'notfound@jasrapo.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when user is deleted', async () => {
      prismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        email: 'deleted@jasrapo.com',
        password: 'hashedPassword',
        deletedAt: new Date(),
      });

      await expect(
        service.validateUser({
          email: 'deleted@jasrapo.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should login successfully and create session in Redis', async () => {
      prismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        email: 'test@jasrapo.com',
        password: 'hashedPassword',
        deletedAt: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      jwtService.decode
        .mockReturnValueOnce({ iat: 1000, exp: 2000 })
        .mockReturnValueOnce({ iat: 1000, exp: 2000 });
      prismaService.profiles.findUnique.mockResolvedValue(null);
      redisSessionService.setSession.mockResolvedValue();

      const result = await service.login(
        { email: 'test@jasrapo.com', password: 'Password123!' },
        '127.0.0.1',
        'Chrome',
      );

      expect(result.accessToken).toBe('access-token');
      expect(redisSessionService.setSession).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      prismaService.users.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@jasrapo.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException when Redis fails', async () => {
      prismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        email: 'test@jasrapo.com',
        password: 'hashedPassword',
        deletedAt: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      redisSessionService.setSession.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(
        service.login(
          { email: 'test@jasrapo.com', password: 'Password123!' },
          '127.0.0.1',
          'Chrome',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('logout', () => {
    it('should revoke session in Redis', async () => {
      redisSessionService.getSession.mockResolvedValue({
        sessionsId: 'test-uuid-1234-5678',
        usersId: 1,
        isRevoked: false,
        expiresAt: Date.now() + 86400000,
      } as any);
      redisSessionService.setSession.mockResolvedValue();

      await service.logout('test-uuid-1234-5678', 1);

      expect(redisSessionService.setSession).toHaveBeenCalled();
    });

    it('should handle when session not found', async () => {
      redisSessionService.getSession.mockResolvedValue(null);

      await service.logout('test-uuid-1234-5678', 1);

      expect(redisSessionService.setSession).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      redisSessionService.getSession.mockResolvedValue({
        sessionsId: 'test-uuid-1234-5678',
        usersId: 1,
        email: 'test@jasrapo.com',
        isRevoked: false,
        refreshToken: 'hashedRefreshToken',
        expiresAt: Date.now() + 86400000,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedToken');
      jwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      jwtService.decode
        .mockReturnValueOnce({ iat: 1000, exp: 2000 })
        .mockReturnValueOnce({ iat: 1000, exp: 2000 });
      redisSessionService.setSession.mockResolvedValue();
      prismaService.profiles.findUnique.mockResolvedValue(null);

      const result = await service.refreshAccessToken(
        'test-uuid-1234-5678',
        'validRefreshToken',
        '127.0.0.1',
        'Chrome',
        1,
      );

      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw when session not found', async () => {
      redisSessionService.getSession.mockResolvedValue(null);

      await expect(
        service.refreshAccessToken(
          'invalid-session',
          'refreshToken',
          '127.0.0.1',
          'Chrome',
          1,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when session is revoked', async () => {
      redisSessionService.getSession.mockResolvedValue({
        sessionsId: 'test-uuid-1234-5678',
        usersId: 1,
        isRevoked: true,
        refreshToken: 'hashedToken',
        expiresAt: Date.now() + 86400000,
      } as any);

      await expect(
        service.refreshAccessToken(
          'test-uuid-1234-5678',
          'refreshToken',
          '127.0.0.1',
          'Chrome',
          1,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when session is expired', async () => {
      redisSessionService.getSession.mockResolvedValue({
        sessionsId: 'test-uuid-1234-5678',
        usersId: 1,
        isRevoked: false,
        refreshToken: 'hashedToken',
        expiresAt: Date.now() - 1000,
      } as any);

      await expect(
        service.refreshAccessToken(
          'test-uuid-1234-5678',
          'refreshToken',
          '127.0.0.1',
          'Chrome',
          1,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
