import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../../../identity/auth/interfaces/http/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const makeContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: undefined },
        }),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    }) as unknown as ExecutionContext;

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should short-circuit and return true when @Public() is set (no token validation)', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return true;
      return undefined;
    });

    const superSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(false);

    try {
      expect(guard.canActivate(makeContext())).toBe(true);
      expect(superSpy).not.toHaveBeenCalled();
    } finally {
      superSpy.mockRestore();
    }
  });

  it('should pass through to passport when @Public() is not set and let it return false for missing token', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const superSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(new Observable<boolean>());

    try {
      const result = guard.canActivate(makeContext());
      expect(superSpy).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Observable);
    } finally {
      superSpy.mockRestore();
    }
  });

  it('should let passport reject with UnauthorizedException when no Authorization header is present', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const superSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockImplementation(() => {
        throw new UnauthorizedException('No auth token');
      });

    try {
      expect(() => guard.canActivate(makeContext())).toThrow(
        UnauthorizedException,
      );
      expect(superSpy).toHaveBeenCalledTimes(1);
    } finally {
      superSpy.mockRestore();
    }
  });
});
