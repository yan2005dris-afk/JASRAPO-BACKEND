import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../metrics/metrics.service';
import { LoggerService } from '../logger/logger.service';
import { parseUserAgent, redactIp } from '../redact';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, originalUrl, ip, headers } = request;
    const startTime = Date.now();
    const route = this.getRouteLabel(originalUrl);
    const userAgentHeader: unknown = headers['user-agent'];
    const userAgentString =
      typeof userAgentHeader === 'string' ? userAgentHeader : '';

    // Increment in-progress metric
    this.metricsService.incrementHttpInProgress(method, route);

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const durationSec = durationMs / 1000;
          const status = response.statusCode.toString();

          this.logger.log(
            `${method} ${originalUrl} ${status} ${durationMs}ms - ${redactIp(ip ?? '')} ${parseUserAgent(userAgentString)}`,
            'HTTP',
          );

          // Record metrics
          this.metricsService.incrementHttpRequest(method, status, route);
          this.metricsService.observeHttpDuration(method, route, durationSec);
        },
        error: (error: unknown) => {
          const durationMs = Date.now() - startTime;
          const durationSec = durationMs / 1000;

          // Extract status code safely using unknown type patterns
          let status = '500';
          let message = 'Unknown error';

          if (error instanceof HttpException) {
            status = error.getStatus().toString();
            message = error.message;
          } else if (error instanceof Error) {
            message = error.message;
            // Check if it has a status property (common in many Node.js libs)
            if ('status' in error && typeof error.status === 'number') {
              status = error.status.toString();
            }
          }

          this.logger.error(
            `${method} ${originalUrl} ${status} ${durationMs}ms - ${message}`,
            undefined,
            'HTTP',
          );
          // Record metrics
          this.metricsService.incrementHttpRequest(method, status, route);
          this.metricsService.observeHttpDuration(method, route, durationSec);
          this.metricsService.incrementError('http', status);
        },
      }),
      finalize(() => {
        // This ensures the counter always decrements, even on error or cancellation
        this.metricsService.decrementHttpInProgress(method, route);
      }),
    );
  }

  private getRouteLabel(url: string): string {
    // Normalize route to handle dynamic IDs
    const normalized = url
      .replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '/:id',
      )
      .replace(/\/\d+/g, '/:id')
      .split('?')[0];

    return normalized || '/';
  }
}
