import { of, lastValueFrom } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
  it('captures evidence metadata attached during controller execution', async () => {
    const auditService = { log: jest.fn().mockResolvedValue(undefined) };
    const request: any = {
      method: 'POST',
      url: '/reading-anomalies',
      params: {},
      headers: {},
      ip: '127.0.0.1',
      socket: {},
      file: {},
    };
    const response: any = { statusCode: 201 };
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    };

    const result = new AuditInterceptor(auditService as any).intercept(
      context,
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
});
