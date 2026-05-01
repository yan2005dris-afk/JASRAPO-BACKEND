import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'LOG_LEVEL') return 'info';
      if (key === 'LOG_PRETTY') return false;
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log methods', () => {
    it('should call log without context', () => {
      const pino = service.getPinoLogger();
      const spy = jest.spyOn(pino, 'info');
      service.log('test message');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should call log with context', () => {
      const pino = service.getPinoLogger();
      const spy = jest.spyOn(pino, 'info');
      service.log('test message', 'TestController');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should call error without trace', () => {
      const pino = service.getPinoLogger();
      const spy = jest.spyOn(pino, 'error');
      service.error('error message');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should call error with trace and context', () => {
      const pino = service.getPinoLogger();
      const spy = jest.spyOn(pino, 'error');
      service.error('error message', 'stack trace', 'TestController');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should call warn', () => {
      const pino = service.getPinoLogger();
      const spy = jest.spyOn(pino, 'warn');
      service.warn('warning message', 'TestController');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should call debug', () => {
      const pino = service.getPinoLogger();
      const spy = jest.spyOn(pino, 'debug');
      service.debug('debug message', 'TestController');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should call verbose', () => {
      const pino = service.getPinoLogger();
      const spy = jest.spyOn(pino, 'trace');
      service.verbose('verbose message', 'TestController');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('child method', () => {
    it('should create a child logger', () => {
      const child = service.child({ context: 'TestChild' });
      expect(child).toBeDefined();
      expect(child).toBeInstanceOf(LoggerService);
    });
  });

  describe('getPinoLogger method', () => {
    it('should return the internal pino logger', () => {
      const pinoLogger = service.getPinoLogger();
      expect(pinoLogger).toBeDefined();
      expect(typeof pinoLogger.info).toBe('function');
    });
  });
});