import { of, lastValueFrom } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
  function makeContext(request: any, response: any = { statusCode: 201 }) {
    return {
      switchToHttp: () => ({
        getType: () => 'http',
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as any;
  }

  const baseRequest = {
    method: 'POST',
    url: '/reading-anomalies',
    params: {},
    headers: {},
    ip: '127.0.0.1',
    socket: {},
  };

  it('captures evidence metadata from a single uploaded file', async () => {
    const auditService = { log: jest.fn().mockResolvedValue(undefined) };
    const request: any = {
      ...baseRequest,
      file: {},
    };

    const result = new AuditInterceptor(auditService as any).intercept(
      makeContext(request),
      {
        handle: () => {
          request.file.evidenceMetadata = {
            storageKey: 'reading-news/key.webp',
            outcome: 'uploaded',
          };
          return of({});
        },
      },
    );

    await lastValueFrom(result);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          evidence: {
            storageKey: 'reading-news/key.webp',
            outcome: 'uploaded',
          },
        }),
      }),
    );
  });

  it('captures evidence metadata from request.evidenceMetadata (preferred)', async () => {
    const auditService = { log: jest.fn().mockResolvedValue(undefined) };
    const request: any = {
      ...baseRequest,
      file: { evidenceMetadata: { storageKey: 'old.webp' } },
      evidenceMetadata: { storageKey: 'new.webp', outcome: 'uploaded' },
    };

    await lastValueFrom(
      new AuditInterceptor(auditService as any).intercept(
        makeContext(request),
        { handle: () => of({}) },
      ),
    );

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          evidence: { storageKey: 'new.webp', outcome: 'uploaded' },
        }),
      }),
    );
  });

  it('captures evidence metadata from request.files (multi-upload)', async () => {
    const auditService = { log: jest.fn().mockResolvedValue(undefined) };
    const request: any = {
      ...baseRequest,
      files: [
        { evidenceMetadata: { storageKey: 'a.webp' } },
        { evidenceMetadata: { storageKey: 'b.webp' } },
      ],
    };

    await lastValueFrom(
      new AuditInterceptor(auditService as any).intercept(
        makeContext(request),
        { handle: () => of({}) },
      ),
    );

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          evidence: [{ storageKey: 'a.webp' }, { storageKey: 'b.webp' }],
        }),
      }),
    );
  });

  it('omits evidence field when no evidence metadata is attached', async () => {
    const auditService = { log: jest.fn().mockResolvedValue(undefined) };
    const request: any = { ...baseRequest };

    await lastValueFrom(
      new AuditInterceptor(auditService as any).intercept(
        makeContext(request),
        { handle: () => of({}) },
      ),
    );

    const metadata = auditService.log.mock.calls[0][0].metadata;
    expect(metadata).not.toHaveProperty('evidence');
  });
});
