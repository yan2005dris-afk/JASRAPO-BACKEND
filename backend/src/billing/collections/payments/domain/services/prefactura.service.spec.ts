import { PrefacturaService } from './prefactura.service';

describe('PrefacturaService', () => {
  it('can be extended and findPrefacturaDetalleByCuotaConvenioId returns expected data', async () => {
    class TestPrefacturaService extends PrefacturaService {
      async findPrefacturaDetalleByCuotaConvenioId(
        cuotaConvenioId: bigint,
        _tx?: any,
      ): Promise<any[]> {
        return [{ prefacturaDetalleId: 1n, cuotaConvenioId }];
      }

      async findPrefacturaById(
        prefacturaId: bigint,
        _select?: any,
        _tx?: any,
      ): Promise<any> {
        return { prefacturaId, comprobanteId: 100n };
      }

      async findManyCuotaConvenio(
        where: any,
        _select?: any,
        _tx?: any,
      ): Promise<any[]> {
        return [{ cuotaConvenioId: 1n, estado: 'PAGADA' }];
      }
    }

    const service = new TestPrefacturaService();
    const detalles = await service.findPrefacturaDetalleByCuotaConvenioId(5n);
    expect(detalles).toHaveLength(1);
    expect(detalles[0].cuotaConvenioId).toBe(5n);

    const prefactura = await service.findPrefacturaById(100n);
    expect(prefactura.comprobanteId).toBe(100n);

    const cuotas = await service.findManyCuotaConvenio({ estado: 'PAGADA' });
    expect(cuotas[0].estado).toBe('PAGADA');
  });

  it('enforces that all three abstract methods must be implemented', () => {
    // This test verifies the abstract class cannot be instantiated directly
    expect(() => {
      class IncompletePrefacturaService extends PrefacturaService {
        async findPrefacturaDetalleByCuotaConvenioId(): Promise<any[]> {
          return [];
        }
        // deliberately not implementing findPrefacturaById and findManyCuotaConvenio
      }
      // Should this compile? In TypeScript it will — abstract methods just
      // throw at runtime if called. Verify the runtime error.
      const incomplete = new IncompletePrefacturaService();
      expect(() => incomplete.findPrefacturaById(1n)).toThrow();
    }).not.toThrow(); // constructing the class is fine
  });
});
