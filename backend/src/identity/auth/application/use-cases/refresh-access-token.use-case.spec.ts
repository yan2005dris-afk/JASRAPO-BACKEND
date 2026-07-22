import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RefreshAccessTokenUseCase } from './refresh-access-token.use-case';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from '../../../sessions/application/sessions.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('RefreshAccessTokenUseCase', () => {
  let useCase: RefreshAccessTokenUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let sessionsService: jest.Mocked<SessionsService>;

  const sessionSecret = 'a'.repeat(64);
  const refreshPayload = {
    sub: 1,
    sid: 'sid',
    email: 'test@test.com',
    tokenVersion: 1,
    sessionSecret,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        RefreshAccessTokenUseCase,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
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
            getSession: jest.fn(),
            rotateSession: jest.fn(),
            revokeSession: jest.fn(),
            revokeAllUserSessions: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    useCase = module.get<RefreshAccessTokenUseCase>(RefreshAccessTokenUseCase);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
    sessionsService = module.get(SessionsService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should refresh tokens and increment tokenVersion', async () => {
      const mockSession = {
        sesionId: 'sid',
        sessionSecret,
        tokenVersion: 1,
        revocado: false,
        expiraEn: new Date(Date.now() + 100000),
      };

      sessionsService.getSession.mockResolvedValue(mockSession as any);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(refreshPayload);
      (userRepository.findById as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
      });
      jwtService.signAsync.mockResolvedValue('new-token');
      jwtService.decode.mockReturnValue({ iat: 100, exp: 200 });
      sessionsService.rotateSession.mockResolvedValue(1);

      const result = await useCase.execute('sid', 'rt', 'ip', 'ua', 1);

      expect(result).toEqual({
        accessToken: 'new-token',
        refreshToken: 'new-token',
        accessTokenInfo: {
          iat: 100,
          exp: 200,
          iatDate: expect.any(String),
          expDate: expect.any(String),
        },
      });
      expect(sessionsService.rotateSession).toHaveBeenCalledWith(
        'sid',
        expect.objectContaining({
          expectedTokenVersion: 1,
          sessionSecret: expect.stringMatching(/^[0-9a-f]{64}$/),
        }),
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ tokenVersion: 2 }),
        expect.any(Object),
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ tokenVersion: 2 }),
        expect.any(Object),
      );
    });

    it('should allow only one concurrent refresh for the same tokenVersion', async () => {
      const mockSession = {
        sesionId: 'sid',
        sessionSecret,
        tokenVersion: 1,
        revocado: false,
        expiraEn: new Date(Date.now() + 100000),
      };
      let currentVersion = 1;

      sessionsService.getSession.mockResolvedValue(mockSession as any);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(refreshPayload);
      (userRepository.findById as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
      });
      jwtService.signAsync.mockResolvedValue('new-token');
      jwtService.decode.mockReturnValue({ iat: 100, exp: 200 });
      sessionsService.rotateSession.mockImplementation(async (_, data) => {
        if (data.expectedTokenVersion !== currentVersion) return 0;
        currentVersion += 1;
        return 1;
      });

      const results = await Promise.allSettled([
        useCase.execute('sid', 'rt', 'ip', 'ua', 1),
        useCase.execute('sid', 'rt', 'ip', 'ua', 1),
      ]);

      expect(
        results.filter(({ status }) => status === 'fulfilled'),
      ).toHaveLength(1);
      expect(
        results.filter(({ status }) => status === 'rejected'),
      ).toHaveLength(1);
      const rejected = results.find(({ status }) => status === 'rejected');
      expect(rejected).toMatchObject({
        status: 'rejected',
        reason: expect.objectContaining({
          message: 'Refresh token replay detected',
        }),
      });
    });

    it('should reject a refresh token with an older tokenVersion', async () => {
      sessionsService.getSession.mockResolvedValue({
        sesionId: 'sid',
        sessionSecret,
        tokenVersion: 2,
        revocado: false,
        expiraEn: new Date(Date.now() + 100000),
      } as any);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(refreshPayload);

      await expect(useCase.execute('sid', 'rt', 'ip', 'ua', 1)).rejects.toThrow(
        'Refresh token replay detected',
      );
      expect(sessionsService.rotateSession).not.toHaveBeenCalled();
      // Replay detectado: se revocan TODAS las sesiones del usuario.
      expect(sessionsService.revokeAllUserSessions).toHaveBeenCalledWith(1);
    });

    it('revokes the session when the atomic rotate loses the race (replay)', async () => {
      sessionsService.getSession.mockResolvedValue({
        sesionId: 'sid',
        sessionSecret,
        tokenVersion: 1,
        revocado: false,
        expiraEn: new Date(Date.now() + 100000),
      } as any);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(refreshPayload);
      (userRepository.findById as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
      });
      jwtService.signAsync.mockResolvedValue('new-token');
      jwtService.decode.mockReturnValue({ iat: 100, exp: 200 });
      // Otra request rotó primero: el UPDATE atómico no afecta filas.
      sessionsService.rotateSession.mockResolvedValue(0);

      await expect(useCase.execute('sid', 'rt', 'ip', 'ua', 1)).rejects.toThrow(
        'Refresh token replay detected',
      );
      expect(sessionsService.revokeAllUserSessions).toHaveBeenCalledWith(1);
    });

    it('should reject a refresh token with the wrong sessionSecret', async () => {
      sessionsService.getSession.mockResolvedValue({
        sesionId: 'sid',
        sessionSecret: 'b'.repeat(64),
        tokenVersion: 1,
        revocado: false,
        expiraEn: new Date(Date.now() + 100000),
      } as any);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(refreshPayload);

      await expect(useCase.execute('sid', 'rt', 'ip', 'ua', 1)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(sessionsService.rotateSession).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if session not found', async () => {
      sessionsService.getSession.mockResolvedValue(null);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(refreshPayload);
      await expect(useCase.execute('sid', 'rt', 'ip', 'ua', 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if session revoked', async () => {
      sessionsService.getSession.mockResolvedValue({
        revocado: true,
      } as any);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(refreshPayload);
      await expect(useCase.execute('sid', 'rt', 'ip', 'ua', 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
