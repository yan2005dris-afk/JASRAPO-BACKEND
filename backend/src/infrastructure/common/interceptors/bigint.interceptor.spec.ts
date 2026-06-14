import { BigIntInterceptor } from './bigint.interceptor';
import { of } from 'rxjs';

function runInterceptor(
  interceptor: BigIntInterceptor,
  data: unknown,
): Promise<unknown> {
  const mockContext = {} as any;
  const mockCallHandler = { handle: () => of(data) };
  return new Promise((resolve, reject) => {
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => resolve(result),
      error: (err) =>
        reject(err instanceof Error ? err : new Error(String(err))),
    });
  });
}

describe('BigIntInterceptor', () => {
  let interceptor: BigIntInterceptor;

  beforeEach(() => {
    interceptor = new BigIntInterceptor();
  });

  describe('convertBigInt', () => {
    it('should convert BigInt values to strings', async () => {
      const result = await runInterceptor(interceptor, {
        amount: BigInt(123),
      });
      expect(result).toEqual({ amount: '123' });
    });

    it('should preserve null and undefined values', async () => {
      const result = await runInterceptor(interceptor, {
        data: null,
        missing: undefined,
      });
      expect(result).toEqual({ data: null, missing: undefined });
    });

    it('should preserve Date objects as-is (not iterate over Date keys)', async () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = await runInterceptor(interceptor, { createdAt: date });
      expect(result).toEqual({ createdAt: date });
      expect((result as any).createdAt).toBeInstanceOf(Date);
    });

    it('should recursively process nested objects', async () => {
      const result = await runInterceptor(interceptor, {
        nested: { value: BigInt(456), name: 'test' },
      });
      expect(result).toEqual({ nested: { value: '456', name: 'test' } });
    });

    it('should process arrays containing BigInt values', async () => {
      const result = await runInterceptor(interceptor, {
        items: [BigInt(1), BigInt(2), BigInt(3)],
      });
      expect(result).toEqual({ items: ['1', '2', '3'] });
    });

    it('should handle plain values that are not objects', async () => {
      const result = await runInterceptor(interceptor, 'plain string');
      expect(result).toBe('plain string');
    });
  });
});
