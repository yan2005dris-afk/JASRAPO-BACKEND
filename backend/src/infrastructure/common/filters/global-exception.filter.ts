import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { LoggerService } from '../../../infrastructure/observability/logger/logger.service';
import {
  DomainException,
  EntityNotFoundException,
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
  UnauthorizedDomainException,
  ForbiddenDomainException,
  DomainValidationException,
} from '../../../shared/domain/exceptions/domain.exception';

interface FormattedValidationError {
  field: string;
  message?: string;
  constraints?: string[];
  children?: FormattedValidationError[];
}

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  errors?: string[] | FormattedValidationError[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: (string | ValidationError)[] | undefined;

    // Manejo de errores de validación (class-validator)
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();

      status = HttpStatus.BAD_REQUEST;

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        // Errors from ValidationPipe
        if (Array.isArray(exceptionResponse.message)) {
          message = 'Error de validación';
          errors = exceptionResponse.message as (string | ValidationError)[];
        } else {
          message = exceptionResponse.message as string;
        }
      } else {
        message = exception.message;
      }
    }
    // Manejo de excepciones de dominio
    else if (exception instanceof DomainException) {
      if (exception instanceof EntityNotFoundException) {
        status = HttpStatus.NOT_FOUND;
      } else if (exception instanceof EntityAlreadyExistsException) {
        status = HttpStatus.CONFLICT;
      } else if (exception instanceof UnauthorizedDomainException) {
        status = HttpStatus.UNAUTHORIZED;
      } else if (exception instanceof ForbiddenDomainException) {
        status = HttpStatus.FORBIDDEN;
      } else if (exception instanceof DomainValidationException) {
        status = HttpStatus.BAD_REQUEST;
      } else if (exception instanceof InvalidDomainOperationException) {
        status = HttpStatus.BAD_REQUEST;
      } else {
        status = HttpStatus.BAD_REQUEST;
      }
      message = exception.message;
    }
    // Manejo de otros errores HTTP
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as any).message;
      } else {
        message = exception.message;
      }
    }
    // Errores no manejados (deberían ser 500)
    else if (exception instanceof Error) {
      const exposeDetails =
        this.configService.get('EXPOSE_ERROR_DETAILS') === 'true';

      message = exposeDetails
        ? exception.message
        : 'Error interno del servidor';
    }

    if (!(exception instanceof HttpException) && exception instanceof Error) {
      const requestId = this.extractRequestId(request);
      this.loggerService.error(
        exception.message,
        exception.stack,
        'GlobalExceptionFilter',
      );
      this.loggerService.log(
        JSON.stringify({
          event: 'unhandled_exception',
          name: exception.name,
          message: exception.message,
          stack: exception.stack,
          path: request.url,
          method: request.method,
          requestId,
        }),
        'GlobalExceptionFilter',
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    if (errors && errors.length > 0) {
      errorResponse.errors =
        typeof errors[0] === 'string'
          ? (errors as string[])
          : this.formatValidationErrors(errors as ValidationError[]);
    }

    response.status(status).json(errorResponse);
  }

  private extractRequestId(request: Request): string | undefined {
    const headerValue =
      (request.headers['x-request-id'] as string | undefined) ??
      (request.headers['x-correlation-id'] as string | undefined);
    return typeof headerValue === 'string' && headerValue.length > 0
      ? headerValue
      : undefined;
  }

  private formatValidationErrors(
    errors: ValidationError[],
  ): FormattedValidationError[] {
    return errors.map((error) => {
      const formatted: FormattedValidationError = {
        field: error.property,
      };

      if (error.constraints) {
        formatted.constraints = Object.values(error.constraints);
        formatted.message = Object.values(error.constraints)[0];
      }

      if (error.children && error.children.length > 0) {
        formatted.children = this.formatValidationErrors(error.children);
      }

      return formatted;
    });
  }
}
