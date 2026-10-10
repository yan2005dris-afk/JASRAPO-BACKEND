import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';
import type { LoggerService } from '../../infrastructure/observability/logger/logger.service';
import { ConflictDomainException } from '../../shared/domain/exceptions/domain.exception';

interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
}

const makeMockResponse = (): MockResponse => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

const makeMockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    url: '/api/v1/test',
    method: 'POST',
    headers: {},
    ...overrides,
  }) as Request;

const makeHost = (req: Request, res: MockResponse): ArgumentsHost =>
  ({
    switchToHttp: () => ({
      getResponse: <T = Response>(): T => res as unknown as T,
      getRequest: <T = Request>(): T => req as unknown as T,
      getNext: <T = unknown>(): T => undefined as unknown as T,
    }),
  }) as unknown as ArgumentsHost;

const makeConfigService = (
  exposeDetails: boolean,
): jest.Mocked<Pick<ConfigService, 'get'>> =>
  ({
    get: jest.fn((key: string) =>
      key === 'EXPOSE_ERROR_DETAILS' ? String(exposeDetails) : undefined,
    ),
  }) as unknown as jest.Mocked<Pick<ConfigService, 'get'>>;

const makeLogger = (): jest.Mocked<Pick<LoggerService, 'error' | 'log'>> => ({
  error: jest.fn(),
  log: jest.fn(),
});

describe('GlobalExceptionFilter', () => {
  describe('Prisma-style unhandled errors (status 500)', () => {
    const prismaMessage =
      'Invalid `prisma.user.create()` invocation: Foreign key constraint failed on the field: `fk_user_company` at 10.0.0.5';

    it('returns the generic message when EXPOSE_ERROR_DETAILS=false', () => {
      const configService = makeConfigService(false);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      filter.catch(new Error(prismaMessage), host);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const body = res.json.mock.calls[0][0];
      expect(body.message).toBe('Error interno del servidor');
      expect(body.code).toBe('INTERNAL_SERVER_ERROR');
      expect(body.retryable).toBe(true);
      expect(body.correlationId).toEqual(expect.any(String));
      expect(body.message).not.toContain('Foreign key');
      expect(body.message).not.toContain('10.0.0.5');
      expect(body.stack).toBeUndefined();
    });

    it('leaks the underlying message when EXPOSE_ERROR_DETAILS=true', () => {
      const configService = makeConfigService(true);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      filter.catch(new Error(prismaMessage), host);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const body = res.json.mock.calls[0][0];
      expect(body.message).toBe(prismaMessage);
    });

    it('does NOT depend on NODE_ENV — production NODE_ENV with the flag off still returns the generic message', () => {
      const previousNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        const configService = makeConfigService(false);
        const logger = makeLogger();
        const filter = new GlobalExceptionFilter(
          configService as unknown as ConfigService,
          logger as unknown as LoggerService,
        );

        const res = makeMockResponse();
        const req = makeMockRequest();
        const host = makeHost(req, res);

        filter.catch(new Error(prismaMessage), host);

        const body = res.json.mock.calls[0][0];
        expect(body.message).toBe('Error interno del servidor');
      } finally {
        process.env.NODE_ENV = previousNodeEnv;
      }
    });
  });

  describe('Known HTTP exceptions', () => {
    it('preserves NotFoundException (404) message — intentional, status < 500', () => {
      const configService = makeConfigService(false);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      filter.catch(new NotFoundException('Recurso no encontrado'), host);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      const body = res.json.mock.calls[0][0];
      expect(body.message).toBe('Recurso no encontrado');
      expect(body.code).toBe('NOT_FOUND');
      expect(body.retryable).toBe(false);
      expect(body.correlationId).toEqual(expect.any(String));
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('preserves UnprocessableEntityException (422) message', () => {
      const configService = makeConfigService(false);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      filter.catch(new UnprocessableEntityException('Datos inválidos'), host);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
      const body = res.json.mock.calls[0][0];
      expect(body.message).toBe('Datos inválidos');
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('formats BadRequestException validation errors', () => {
      const configService = makeConfigService(false);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      const validationErr = new BadRequestException({
        message: ['email must be an email', 'name should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(validationErr, host);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = res.json.mock.calls[0][0];
      expect(body.message).toBe('Error de validación');
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.retryable).toBe(false);
      expect(body.correlationId).toEqual(expect.any(String));
      expect(body.errors).toEqual([
        'email must be an email',
        'name should not be empty',
      ]);
    });
  });

  describe('Logging behavior', () => {
    const prismaMessage = 'Prisma: relation `users` does not exist';

    it('logs the full stack via LoggerService.error() regardless of EXPOSE_ERROR_DETAILS=false', () => {
      const configService = makeConfigService(false);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      const err = new Error(prismaMessage);
      filter.catch(err, host);

      expect(logger.error).toHaveBeenCalledTimes(1);
      const [loggedMessage, loggedStack, loggedContext] =
        logger.error.mock.calls[0];
      expect(loggedMessage).toBe(prismaMessage);
      expect(loggedStack).toBe(err.stack);
      expect(loggedContext).toBe('GlobalExceptionFilter');
    });

    it('logs the full stack via LoggerService.error() regardless of EXPOSE_ERROR_DETAILS=true', () => {
      const configService = makeConfigService(true);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      const err = new Error(prismaMessage);
      filter.catch(err, host);

      expect(logger.error).toHaveBeenCalledTimes(1);
      const [, loggedStack] = logger.error.mock.calls[0];
      expect(loggedStack).toBe(err.stack);
    });

    it('emits the structured unhandled_exception event with requestId from header', () => {
      const configService = makeConfigService(false);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest({
        headers: { 'x-request-id': 'req-abc-123' },
      });
      const host = makeHost(req, res);

      const err = new Error('boom');
      err.name = 'PrismaClientKnownRequestError';
      filter.catch(err, host);

      const logCalls = logger.log.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('unhandled_exception'),
      );
      expect(logCalls.length).toBe(1);
      const payload = JSON.parse(logCalls[0][0]);
      expect(payload.event).toBe('unhandled_exception');
      expect(payload.name).toBe('PrismaClientKnownRequestError');
      expect(payload.message).toBe('boom');
      expect(payload.stack).toBe(err.stack);
      expect(payload.path).toBe('/api/v1/test');
      expect(payload.method).toBe('POST');
      expect(payload.requestId).toBe('req-abc-123');
      expect(payload.correlationId).toBe('req-abc-123');
      expect(res.json.mock.calls[0][0].correlationId).toBe(
        payload.correlationId,
      );
    });

    it('generates and logs the response correlationId when no correlation header is present', () => {
      const configService = makeConfigService(false);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      filter.catch(new Error('boom'), host);

      const logCalls = logger.log.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('unhandled_exception'),
      );
      const payload = JSON.parse(logCalls[0][0]);
      const responseCorrelationId = res.json.mock.calls[0][0].correlationId;
      expect(responseCorrelationId).toEqual(expect.any(String));
      expect(payload.requestId).toBe(responseCorrelationId);
      expect(payload.correlationId).toBe(responseCorrelationId);
    });
  });

  it('maps ConflictDomainException to HTTP 409', () => {
    const filter = new GlobalExceptionFilter(
      makeConfigService(false) as unknown as ConfigService,
      makeLogger() as unknown as LoggerService,
    );
    const res = makeMockResponse();
    const req = makeMockRequest();

    filter.catch(
      new ConflictDomainException('La ruta fue modificada por otro operario'),
      makeHost(req, res),
    );

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe('La ruta fue modificada por otro operario');
    expect(body.code).toBe('CONFLICT');
    expect(body.retryable).toBe(true);
  });

  describe('Response body never contains a stack trace', () => {
    it('does not include the stack even when EXPOSE_ERROR_DETAILS=true', () => {
      const configService = makeConfigService(true);
      const logger = makeLogger();
      const filter = new GlobalExceptionFilter(
        configService as unknown as ConfigService,
        logger as unknown as LoggerService,
      );

      const res = makeMockResponse();
      const req = makeMockRequest();
      const host = makeHost(req, res);

      const err = new Error('sensitive internal message');
      filter.catch(err, host);

      const body = res.json.mock.calls[0][0];
      expect(body.message).toBe('sensitive internal message');
      expect(body.stack).toBeUndefined();
      expect(body.trace).toBeUndefined();
      const stringified = JSON.stringify(body);
      expect(stringified).not.toContain('Error: sensitive internal message');
    });
  });
});
