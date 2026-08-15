import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { RefreshTokenStrategy } from './refresh.strategy';
import type { SessionsService } from '../../../../sessions/application/sessions.service';

describe('RefreshTokenStrategy', () => {
  let strategy: RefreshTokenStrategy;
  let configService: jest.Mocked<ConfigService>;
  let sessionsService: jest.Mocked<Pick<SessionsService, 'getSession'>>;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('refresh-secret-key-12345'),
    } as any;
    sessionsService = {
      getSession: jest.fn(),
    };

    strategy = new RefreshTokenStrategy(
      configService,
      sessionsService as unknown as SessionsService,
    );
  });

  it('should throw UnauthorizedException if refresh secret is missing', () => {
    configService.get.mockReturnValue(undefined);
    expect(
      () =>
        new RefreshTokenStrategy(
          configService,
          sessionsService as unknown as SessionsService,
        ),
    ).toThrow(UnauthorizedException);
  });

  it('should validate and return sub, sessionsId, email for valid session', async () => {
    const payload = { sub: 5, sid: 'session-555', email: 'user@example.com' };
    sessionsService.getSession.mockResolvedValue({
      revocado: false,
      expiraEn: new Date(Date.now() + 100000),
    } as any);

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      sub: 5,
      sessionsId: 'session-555',
      email: 'user@example.com',
    });
  });

  it('should throw UnauthorizedException when sub or sid are missing', async () => {
    await expect(strategy.validate({ sub: 0, sid: '' } as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when session is revoked or expired', async () => {
    const payload = { sub: 5, sid: 'session-555' };
    sessionsService.getSession.mockResolvedValue({
      revocado: true,
      expiraEn: new Date(Date.now() + 100000),
    } as any);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should extract refresh token from cookies', () => {
    const extractor = (strategy as any).getRefreshToken;
    expect(extractor(undefined)).toBeNull();
    expect(extractor({ cookies: null })).toBeNull();
    expect(extractor({ cookies: { refreshToken: 'cookie-rt-val' } })).toBe(
      'cookie-rt-val',
    );
  });
});
