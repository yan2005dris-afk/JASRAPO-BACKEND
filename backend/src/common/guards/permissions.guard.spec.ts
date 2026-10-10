import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { LoggerService } from '../../infrastructure/observability/logger/logger.service';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ForbiddenException when @RequiredPermission is missing on a non-public route (fail-closed)', () => {
    const mockContext = {
      getHandler: jest.fn().mockReturnValue(function noop() {}),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          user: {
            usersId: 1,
            permisos: [{ recurso: 'test', accion: 'create' }],
          },
        }),
      }),
    } as unknown as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      return undefined;
    });
    (reflector.get as jest.Mock).mockReturnValue(undefined);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Missing @RequiredPermission decorator on protected route',
    );
  });

  it('should pass when user has the matching permission declared via @RequiredPermission', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          user: {
            usersId: 1,
            permisos: [{ recurso: 'test', accion: 'read' }],
          },
        }),
      }),
    } as unknown as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === PERMISSION_KEY) {
        return { recurso: 'test', accion: 'read' };
      }
      return undefined;
    });

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks the declared permission', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          user: {
            usersId: 1,
            permisos: [{ recurso: 'other', accion: 'read' }],
          },
        }),
      }),
    } as unknown as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === PERMISSION_KEY) {
        return { recurso: 'test', accion: 'read' };
      }
      return undefined;
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is not identified', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === PERMISSION_KEY) {
        return { recurso: 'test', accion: 'read' };
      }
      return undefined;
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Usuario no identificado',
    );
  });

  it('should skip the permission check entirely when @Public() is set', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn().mockReturnValue({ name: 'PublicController' }),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          user: undefined,
        }),
      }),
    } as unknown as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return true;
      return undefined;
    });

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should never invent a permission from controller name + HTTP verb (regression: inferPermission removed)', () => {
    const mockContext = {
      getHandler: jest.fn().mockReturnValue(function create() {}),
      getClass: jest.fn().mockReturnValue({ name: 'ClientesController' }),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          user: {
            usersId: 1,
            permisos: [{ recurso: 'clientes', accion: 'create' }],
          },
        }),
      }),
    } as unknown as ExecutionContext;

    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      return undefined;
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Missing @RequiredPermission decorator on protected route',
    );
  });
});
