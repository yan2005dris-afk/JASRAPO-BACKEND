import { Decimal } from 'decimal.js';
import { DecimalToStringInterceptor } from './decimal-to-string.interceptor';
import { of } from 'rxjs';

function runInterceptor(
  interceptor: DecimalToStringInterceptor,
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

describe('DecimalToStringInterceptor', () => {
  let interceptor: DecimalToStringInterceptor;

  beforeEach(() => {
    interceptor = new DecimalToStringInterceptor();
  });

  describe('transformDecimals', () => {
    it('should serialize a Prisma Decimal as a string (canonical form)', async () => {
      const result = await runInterceptor(interceptor, {
        total: new Decimal('150.00'),
      });

      expect(typeof (result as any).total).toBe('string');
      expect((result as any).total).toBe(new Decimal('150.00').toString());
    });

    it('should not destroy monetary precision (no float drift)', async () => {
      // Famous float drift case: 0.1 + 0.2 === 0.30000000000000004 in IEEE 754.
      // With Decimal, the answer stays exact.
      const result = await runInterceptor(interceptor, {
        monto: new Decimal('0.1').plus(new Decimal('0.2')),
      });

      expect(typeof (result as any).monto).toBe('string');
      expect((result as any).monto).toBe('0.3');
      expect((result as any).monto).not.toBe('0.30000000000000004');
    });

    it('should recursively process nested objects with multiple Decimals', async () => {
      const result = await runInterceptor(interceptor, {
        prefacturaId: 1,
        subtotal: new Decimal('100.00'),
        iva: new Decimal('15.00'),
        totalPagar: new Decimal('115.00'),
        saldoActual: new Decimal('115.00'),
        detalles: [
          {
            cantidad: 1,
            precioUnitario: new Decimal('100.00'),
            subtotal: new Decimal('100.00'),
          },
          {
            cantidad: 2,
            precioUnitario: new Decimal('7.50'),
            subtotal: new Decimal('15.00'),
          },
        ],
      });

      const r = result as any;
      expect(typeof r.subtotal).toBe('string');
      expect(typeof r.iva).toBe('string');
      expect(typeof r.totalPagar).toBe('string');
      expect(typeof r.saldoActual).toBe('string');
      expect(typeof r.detalles[0].precioUnitario).toBe('string');
      expect(typeof r.detalles[0].subtotal).toBe('string');
      expect(typeof r.detalles[1].precioUnitario).toBe('string');
      expect(typeof r.detalles[1].subtotal).toBe('string');
      // Non-Decimal fields untouched.
      expect(r.prefacturaId).toBe(1);
      expect(r.detalles[0].cantidad).toBe(1);
    });

    it('should process arrays containing Decimals', async () => {
      const result = await runInterceptor(interceptor, {
        items: [
          new Decimal('10.00'),
          new Decimal('20.50'),
          new Decimal('0.01'),
        ],
      });

      expect(result).toEqual({ items: ['10', '20.5', '0.01'] });
    });

    it('should pass non-Decimal values through unchanged', async () => {
      const input = {
        name: 'Planilla Jun-2026',
        count: 42,
        active: true,
        ratio: 0.5,
        nullable: null,
        missing: undefined,
      };
      const result = await runInterceptor(interceptor, input);
      expect(result).toEqual(input);
    });

    it('should preserve null and undefined as-is', async () => {
      const result = await runInterceptor(interceptor, {
        data: null,
        missing: undefined,
      });
      expect(result).toEqual({ data: null, missing: undefined });
    });

    it('should preserve Date objects as-is (no Decimal conversion)', async () => {
      const date = new Date('2024-06-15T12:00:00.000Z');
      const result = await runInterceptor(interceptor, { createdAt: date });
      expect(result).toEqual({ createdAt: date });
      expect((result as any).createdAt).toBeInstanceOf(Date);
    });

    it('should recurse into Map values', async () => {
      const map = new Map<string, unknown>([
        ['subtotal', new Decimal('99.99')],
        ['label', 'tariff'],
      ]);
      const result = (await runInterceptor(interceptor, { m: map })) as any;

      expect(result.m).toBeInstanceOf(Map);
      expect(typeof result.m.get('subtotal')).toBe('string');
      expect(result.m.get('subtotal')).toBe(new Decimal('99.99').toString());
      expect(result.m.get('label')).toBe('tariff');
    });

    it('should handle plain values that are not objects', async () => {
      const result = await runInterceptor(interceptor, 'plain string');
      expect(result).toBe('plain string');
    });

    it('should detect a Decimal mock by constructor name', async () => {
      const decimalMock = {
        constructor: { name: 'Decimal' },
        toString: () => '150.00',
      } as any;

      const result = await runInterceptor(interceptor, { tasa: decimalMock });
      expect(typeof (result as any).tasa).toBe('string');
      expect((result as any).tasa).toBe('150.00');
    });
  });
});
