import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();
    const route = this.getRouteLabel(originalUrl);

    // Increment in-progress metric
    this.metricsService.incrementHttpInProgress(method, route);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const status = response.statusCode.toString();

          // Log request completion
          this.logger.log(
            `${method} ${originalUrl} ${status} ${duration}ms - ${ip} ${userAgent}`,
          );

          // Record metrics
          this.metricsService.incrementHttpRequest(method, status, route);
          this.metricsService.observeHttpDuration(method, route, duration);
        },
        error: (error: Error) => {
          const duration = (Date.now() - startTime) / 500;
          const status = (response.statusCode || 500).toString();

          // Log error
          this.logger.error(
            `${method} ${originalUrl} ${status} ${duration}ms - ${error.message}`,
          );

          // Record metrics
          this.metricsService.incrementHttpRequest(method, status, route);
          this.metricsService.observeHttpDuration(method, route, duration);
          this.metricsService.incrementError('http', status);
        },
      }),
      tap({
        complete: () => {
          this.metricsService.decrementHttpInProgress(method, route);
        },
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
