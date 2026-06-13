import { DecimalToNumberInterceptor } from './decimal-to-number.interceptor';
import { of } from 'rxjs';

function runInterceptor(
  interceptor: DecimalToNumberInterceptor,
  data: unknown,
): Promise<unknown> {
  const mockContext = {} as any;
  const mockCallHandler = { handle: () => of(data) };
  return new Promise((resolve, reject) => {
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => resolve(result),
      error: (err) => reject(err),
    });
  });
}

describe('DecimalToNumberInterceptor', () => {
  let interceptor: DecimalToNumberInterceptor;

  beforeEach(() => {
    interceptor = new DecimalToNumberInterceptor();
  });

  describe('transformDecimals', () => {
    it('should convert Decimal-like objects at the property value level', async () => {
      const decimalMock = {
        constructor: { name: 'Decimal' },
        _isDecimal: true,
      } as any;

      const result = await runInterceptor(interceptor, { tasa: decimalMock });
      // Number(decimalMock) = NaN because the mock isn't a real Decimal
      expect(typeof (result as any).tasa).toBe('number');
    });

    it('should preserve null and undefined values', async () => {
      const result = await runInterceptor(interceptor, {
        data: null,
        missing: undefined,
      });
      expect(result).toEqual({ data: null, missing: undefined });
    });

    it('should preserve Date objects as-is (not attempt Decimal conversion)', async () => {
      const date = new Date('2024-06-15T12:00:00.000Z');
      const result = await runInterceptor(interceptor, { createdAt: date });
      expect(result).toEqual({ createdAt: date });
      expect((result as any).createdAt).toBeInstanceOf(Date);
    });

    it('should recursively process nested objects', async () => {
      const decimalMock = {
        constructor: { name: 'Decimal' },
        _isDecimal: true,
      } as any;

      const result = await runInterceptor(interceptor, {
        nested: { amount: decimalMock },
      });
      expect(typeof (result as any).nested.amount).toBe('number');
    });
  });
});
