import express from 'express';
import helmet from 'helmet';
import request from 'supertest';
import { resolveCorsOptions } from './cors.options';

describe('resolveCorsOptions', () => {
  const credentials = true;

  it('throws when CORS_ORIGIN="*" is combined with credentials=true', () => {
    expect(() => resolveCorsOptions({ corsOrigin: '*', credentials })).toThrow(
      /CORS_ORIGIN='\*' combined with credentials=true is forbidden/,
    );
  });

  it('error message includes the current CORS_ORIGIN value and a fix hint', () => {
    let captured: Error | undefined;
    try {
      resolveCorsOptions({ corsOrigin: '*', credentials });
    } catch (err) {
      captured = err as Error;
    }
    expect(captured).toBeDefined();
    expect(captured!.message).toContain('CORS_ORIGIN="*"');
    expect(captured!.message).toContain(
      'CORS_ORIGIN="http://localhost:4200,https://app.example.com"',
    );
  });

  it('succeeds and reflects every origin when CORS_ORIGIN="*" with credentials=false', () => {
    const options = resolveCorsOptions({
      corsOrigin: '*',
      credentials: false,
    });
    expect(options.origin).toBe(true);
    expect(options.credentials).toBe(false);
    expect(options.methods).toBe('GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  });

  it('splits a comma-separated allow-list and trims each entry', () => {
    const options = resolveCorsOptions({
      corsOrigin: 'http://localhost:4200, https://app.example.com',
      credentials,
    });
    expect(options.origin).toEqual([
      'http://localhost:4200',
      'https://app.example.com',
    ]);
    expect(options.credentials).toBe(true);
    expect(options.allowedHeaders).toContain('Authorization');
  });
});

describe('helmet middleware integration', () => {
  function buildTestApp() {
    const app = express();
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
          },
        },
      }),
    );
    app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok' }));
    return app;
  }

  it('sets Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Content-Security-Policy', async () => {
    const app = buildTestApp();
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);

    expect(response.headers['strict-transport-security']).toMatch(/max-age=/);
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['referrer-policy']).toBeDefined();
    expect(response.headers['content-security-policy']).toContain(
      "default-src 'self'",
    );
    expect(response.headers['content-security-policy']).toContain(
      "script-src 'self' 'unsafe-inline'",
    );
    expect(response.headers['content-security-policy']).toContain(
      "style-src 'self' 'unsafe-inline'",
    );
    expect(response.headers['content-security-policy']).toContain(
      "img-src 'self' data:",
    );
  });
});
