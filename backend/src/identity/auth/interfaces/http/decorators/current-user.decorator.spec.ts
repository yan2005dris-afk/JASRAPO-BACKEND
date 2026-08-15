import type { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

function getParamDecoratorFactory(decorator: any) {
  class TestTarget {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testMethod(@CurrentUser() _user: any) {}
  }
  const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestTarget, 'testMethod');
  const key = Object.keys(metadata)[0];
  return metadata[key].factory;
}

describe('CurrentUser decorator', () => {
  let factory: (data: any, ctx: ExecutionContext) => any;

  beforeEach(() => {
    factory = getParamDecoratorFactory(CurrentUser);
  });

  it('should return entire user object when no key provided', () => {
    const mockUser = { sub: 10, usersId: 10, sid: 'session-10', permisos: [] };
    const mockCtx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as ExecutionContext;

    const result = factory(undefined, mockCtx);
    expect(result).toEqual(mockUser);
  });

  it('should return specific field when key provided', () => {
    const mockUser = { sub: 10, usersId: 10, sid: 'session-10', email: 'test@mail.com', permisos: [] };
    const mockCtx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as ExecutionContext;

    const result = factory('email', mockCtx);
    expect(result).toBe('test@mail.com');
  });
});
