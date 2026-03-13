import { Logger } from '@nestjs/common';
import { RedisSessionService } from './redis-session.service';

describe('RedisSessionService', () => {
  const redisUpMsg = '[REDIS:UP] Conexion a Redis establecida correctamente';
  const redisDownMsg = '[REDIS:DOWN] No se pudo conectar a Redis';

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('logs REDIS:UP when ping succeeds', async () => {
    const redisMock = {
      ping: jest.fn().mockResolvedValue('PONG'),
    } as any;

    const service = new RedisSessionService(redisMock);
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    await service.onModuleInit();

    expect(redisMock.ping).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(redisUpMsg);
  });

  it('logs REDIS:DOWN and rethrows when ping fails', async () => {
    const error = new Error('redis down');
    const redisMock = {
      ping: jest.fn().mockRejectedValue(error),
    } as any;

    const service = new RedisSessionService(redisMock);
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    await expect(service.onModuleInit()).rejects.toThrow(error);
    expect(errorSpy).toHaveBeenCalledWith(redisDownMsg, error.stack);
  });
});
