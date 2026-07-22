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
      // Gate detail exposure on an explicit operator flag, NOT on NODE_ENV.
      // Default is OFF: production deploys that forgot to flip NODE_ENV still
      // return a generic message instead of leaking Prisma column/FK/IP details.
      const exposeDetails =
        this.configService.get('EXPOSE_ERROR_DETAILS') === 'true';

      message = exposeDetails
        ? exception.message
        : 'Error interno del servidor';
    }

    // Log full stack to Loki for every unhandled exception, regardless of
    // whether the response body exposes the message. Never put the stack in
    // the response body — it leaks column names, FK chains, internal IPs.
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

    // Agregar errores de validación si existen
    if (errors && errors.length > 0) {
      // Si son strings (formato por defecto de ValidationPipe), los devolvemos directamente
      // Si son objetos ValidationError, los formateamos
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

  /**
   * Formatea los errores de validación para ser más legibles
   */
  private formatValidationErrors(
    errors: ValidationError[],
  ): FormattedValidationError[] {
    return errors.map((error) => {
      const formatted: FormattedValidationError = {
        field: error.property,
      };

      // Agregar las restricciones de validación
      if (error.constraints) {
        formatted.constraints = Object.values(error.constraints);
        // Primer constraint como mensaje principal
        formatted.message = Object.values(error.constraints)[0];
      }

      // Errores anidados (para objetos embebidos)
      if (error.children && error.children.length > 0) {
        formatted.children = this.formatValidationErrors(error.children);
      }

      return formatted;
    });
  }
}
