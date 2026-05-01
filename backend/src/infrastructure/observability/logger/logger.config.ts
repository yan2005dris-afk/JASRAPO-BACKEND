import pino from 'pino';
import { ConfigService } from '@nestjs/config';
import http from 'http';

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

// Stream para Loki - envía logs al servidor de Loki
function createLokiStream(lokiUrl: string, labels: Record<string, string>) {
  const stream = {
    write: (chunk: string) => {
      try {
        const logEntry = JSON.parse(chunk);
        
        // Formato para Loki
        const payload = {
          streams: [
            {
              stream: {
                ...labels,
                level: logEntry.level || 'info',
              },
              values: [
                [
                  Date.now() * 1000000, // nano segundos
                  chunk,
                ],
              ],
            },
          ],
        };

        // Enviar a Loki
        const req = http.request(
          `${lokiUrl}/loki/api/v1/push`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 400) {
              console.error('Loki error:', res.statusCode);
            }
          },
        );
        
        req.on('error', () => {}); // Silenciar errores de red
        req.write(JSON.stringify(payload));
        req.end();
      } catch {
        // Si no es JSON válido, ignorar
      }
    },
  };
  return stream;
}

export function buildPinoOptions(configService: ConfigService): pino.LoggerOptions {
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
  };

  // En producción, agregar stream de Loki
  const isProduction = process.env.NODE_ENV === 'production';
  const lokiUrl = process.env.LOKI_URL || 'http://jasrapo-loki:3100';
  
  if (isProduction) {
    const lokiStream = createLokiStream(lokiUrl, {
      app: 'jasrapo-backend',
      environment: process.env.NODE_ENV || 'production',
    });

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