import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import type { UserService } from 'src/identity/users/application/user.service';
import type { SessionsService } from '../../../../sessions/application/sessions.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;
  let userService: jest.Mocked<Pick<UserService, 'getEffectivePermissions'>>;
  let sessionsService: jest.Mocked<Pick<SessionsService, 'getSession'>>;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-secret-key-12345'),
    } as any;
    userService = {
      getEffectivePermissions: jest.fn(),
    };
    sessionsService = {
      getSession: jest.fn(),
    };

    strategy = new JwtStrategy(
      configService,
      userService as unknown as UserService,
      sessionsService as unknown as SessionsService,
    );
  });

  it('should throw UnauthorizedException if secret is missing', () => {
    configService.get.mockReturnValue(undefined);
    expect(
      () =>
        new JwtStrategy(
          configService,
          userService as unknown as UserService,
          sessionsService as unknown as SessionsService,
        ),
    ).toThrow(UnauthorizedException);
  });

  it('should validate and return JwtPayload for a valid token and session', async () => {
    const payload = {
      sub: 1,
      sid: 'session-123',
      email: 'test@example.com',
      tokenVersion: 1,
    };
    const validSession = {
      revocado: false,
      expiraEn: new Date(Date.now() + 100000),
      tokenVersion: 1,
    } as any;
    const permissions = {
      usuarioId: 1,
      permisos: [{ recurso: 'users', accion: 'read' }],
    };

    sessionsService.getSession.mockResolvedValue(validSession);
    userService.getEffectivePermissions.mockResolvedValue(permissions);

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      sub: 1,
      usersId: 1,
      sid: 'session-123',
      email: 'test@example.com',
      permisos: [{ recurso: 'users', accion: 'read' }],
    });
    expect(sessionsService.getSession).toHaveBeenCalledWith(1, 'session-123');
    expect(userService.getEffectivePermissions).toHaveBeenCalledWith(1);
  });

  it('should throw UnauthorizedException when sub or sid are missing', async () => {
    await expect(strategy.validate({ sub: 0, sid: '' } as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when session is revoked or expired', async () => {
    const payload = { sub: 1, sid: 'session-123', tokenVersion: 1 };
    sessionsService.getSession.mockResolvedValue({
      revocado: true,
      expiraEn: new Date(Date.now() + 100000),
      tokenVersion: 1,
    } as any);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when tokenVersion does not match', async () => {
    const payload = { sub: 1, sid: 'session-123', tokenVersion: 1 };
    sessionsService.getSession.mockResolvedValue({
      revocado: false,
      expiraEn: new Date(Date.now() + 100000),
      tokenVersion: 2,
    } as any);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
