import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as http from 'http';
import pino, { Logger } from 'pino';
import { buildPinoOptions } from './logger.config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: Logger;
  private lokiUrl: string;
  private labels: Record<string, string>;

  constructor(private readonly configService: ConfigService) {
    this.lokiUrl = this.configService.get<string>(
      'LOKI_URL',
      'http://jasrapo-loki:3100',
    );
    this.labels = {
      app: 'jasrapo-backend',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
    };

    this.logger = pino(buildPinoOptions(configService));
  }

  private sendToLoki(
    level: string,
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    // Solo enviar a Loki en producción
    if (process.env.NODE_ENV !== 'production') return;

    const logEntry = {
      streams: [
        {
          stream: {
            ...this.labels,
            level,
            context: context || 'unknown',
          },
          values: [
            [
              `${Date.now() * 1000000}`,
              JSON.stringify({
                level,
                message,
                context,
                ...metadata,
                timestamp: new Date().toISOString(),
              }),
            ],
          ],
        },
      ],
    };

    const req = http.request(
      `${this.lokiUrl}/loki/api/v1/push`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      () => {},
    );

    req.on('error', () => {});
    req.write(JSON.stringify(logEntry));
    req.end();
  }

  log(message: string, context?: string): void {
    if (context) {
      this.logger.info({ context }, message);
    } else {
      this.logger.info(message);
    }
    this.sendToLoki('info', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    if (context) {
      this.logger.error({ trace, context }, message);
    } else {
      this.logger.error({ trace }, message);
    }
    this.sendToLoki('error', message, context, { trace });
  }

  warn(message: string, context?: string): void {
    if (context) {
      this.logger.warn({ context }, message);
    } else {
      this.logger.warn(message);
    }
    this.sendToLoki('warn', message, context);
  }

  debug(message: string, context?: string): void {
    if (context) {
      this.logger.debug({ context }, message);
    } else {
      this.logger.debug(message);
    }
    this.sendToLoki('debug', message, context);
  }

  verbose(message: string, context?: string): void {
    if (context) {
      this.logger.trace({ context }, message);
    } else {
      this.logger.trace(message);
    }
    this.sendToLoki('trace', message, context);
  }

  child(bindings: Record<string, unknown>): LoggerService {
    const childLogger = this.logger.child(bindings);
    const child = new LoggerService(this.configService);
    return Object.assign(child, { logger: childLogger });
  }

  getPinoLogger(): Logger {
    return this.logger;
  }
}
