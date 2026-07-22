import type pino from 'pino';
import type { ConfigService } from '@nestjs/config';

export interface LoggerConfigOptions {
  level: string;
  pretty: boolean;
}

export function createLoggerConfig(
  configService: ConfigService,
): LoggerConfigOptions {
  const level = configService.get<string>('LOG_LEVEL', 'info');
  const pretty = configService.get<boolean>('LOG_PRETTY', false);

  return { level, pretty };
}

export function buildPinoOptions(
  configService: ConfigService,
): pino.LoggerOptions {
  const { level, pretty } = createLoggerConfig(configService);

  const baseOptions: pino.LoggerOptions = {
    level,
    name: 'jasrapo-backend',
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    mixin: () => ({ environment: process.env.NODE_ENV || 'development' }),
    redact: {
      paths: [
        'req.headers.cookie',
        'req.headers.authorization',
        '*.email',
        '*.ipAddress',
        '*.password',
      ],
      censor: '[REDACTED]',
    },
  };

  // En producción, agregar stream de Loki
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      ...baseOptions,
      // Combinar streams: consola + Loki
      hooks: {
        // Transformar antes de enviar a Loki
      },
    };
  }

  if (pretty) {
    return {
      ...baseOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname,environment',
          messageFormat: '[{name}] {msg}',
        },
      },
    };
  }

  return baseOptions;
}

export const LOGGER_CONFIG_TOKEN = 'LOGGER_CONFIG';
