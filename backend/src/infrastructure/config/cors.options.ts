import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export type ResolveCorsOptionsInput = {
  corsOrigin: string;
  credentials: boolean;
};

const CORS_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
const CORS_ALLOWED_HEADERS = [
  'Content-Type',
  'Accept',
  'Authorization',
  'X-Requested-With',
  'X-HTTP-Method-Override',
];

export function resolveCorsOptions({
  corsOrigin,
  credentials,
}: ResolveCorsOptionsInput): CorsOptions {
  if (corsOrigin === '*' && credentials) {
    throw new Error(
      `[CORS] Insecure configuration rejected at boot: ` +
        `CORS_ORIGIN='*' combined with credentials=true is forbidden ` +
        `(would reflect any origin with credentials). ` +
        `Current CORS_ORIGIN=${JSON.stringify(corsOrigin)}, credentials=${credentials}. ` +
        `Fix: set CORS_ORIGIN to a comma-separated allow-list, e.g. ` +
        `CORS_ORIGIN="http://localhost:4200,https://app.example.com".`,
    );
  }

  return {
    origin:
      corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
    methods: CORS_METHODS,
    credentials,
    allowedHeaders: CORS_ALLOWED_HEADERS,
  };
}
