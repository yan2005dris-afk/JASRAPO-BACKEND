import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';

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
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return capabilities and all session fields on login', async () => {
    const authService = (controller as any).authService as jest.Mocked<AuthService>;
    authService.login.mockResolvedValueOnce({
      accessToken: 'access-jwt',
      refreshToken: 'refresh-jwt',
      sid: 'sid-1',
      sub: 1,
      email: 'admin@jasrapo.com',
      nombre: 'Admin User',
      rolId: 1,
      nombreRol: 'Administrador',
      avatar: 'https://example.com/avatar.png',
      accessTokenInfo: {
        iatDate: '2026-08-15T00:00:00.000Z',
        expDate: '2026-08-15T01:00:00.000Z',
      },
      capabilities: [{ resource: 'operator', action: 'read' }],
    } as any);

    const mockReq = { ip: '127.0.0.1', headers: { 'user-agent': 'Jest' } } as any;
    const mockRes = {
      cookie: jest.fn(),
      json: jest.fn(),
    } as any;

    await controller.login({ email: 'admin@jasrapo.com', password: 'pwd' }, mockReq, undefined, mockRes);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-jwt',
      expect.any(Object),
    );
    expect(mockRes.json).toHaveBeenCalledWith({
      accessToken: 'access-jwt',
      sid: 'sid-1',
      sub: 1,
      email: 'admin@jasrapo.com',
      nombre: 'Admin User',
      rolId: 1,
      nombreRol: 'Administrador',
      avatar: 'https://example.com/avatar.png',
      createdAt: '2026-08-15T00:00:00.000Z',
      expiresAt: '2026-08-15T01:00:00.000Z',
      capabilities: [{ resource: 'operator', action: 'read' }],
    });
  });

  it('should return updated capabilities and all refresh fields on refresh', async () => {
    const authService = (controller as any).authService as jest.Mocked<AuthService>;
    authService.refreshAccessToken.mockResolvedValueOnce({
      accessToken: 'new-access-jwt',
      refreshToken: 'new-refresh-jwt',
      accessTokenInfo: {
        iatDate: '2026-08-15T01:00:00.000Z',
        expDate: '2026-08-15T02:00:00.000Z',
      },
      capabilities: [{ resource: 'billing', action: 'read' }],
    } as any);

    const mockReq = {
      user: { sessionsId: 'sid-1', usersId: 1, sub: 1 },
      ip: '127.0.0.1',
      headers: { 'user-agent': 'Jest' },
    } as any;
    const mockRes = {
      cookie: jest.fn(),
      json: jest.fn(),
    } as any;

    await controller.refresh(mockReq, 'old-rt', mockRes);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh-jwt',
      expect.any(Object),
    );
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token refrescado correctamente',
      accessToken: 'new-access-jwt',
      createdAt: '2026-08-15T01:00:00.000Z',
      expiresAt: '2026-08-15T02:00:00.000Z',
      capabilities: [{ resource: 'billing', action: 'read' }],
    });
  });
});
