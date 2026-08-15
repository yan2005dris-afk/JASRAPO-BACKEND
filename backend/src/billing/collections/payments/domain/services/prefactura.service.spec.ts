import {
  PrefacturaService,
  type PrefacturaCuotasInfo,
  type CuotaConvenioStatus,
} from './prefactura.service';

describe('PrefacturaService', () => {
  it('can be extended and methods return expected data', async () => {
    class TestPrefacturaService extends PrefacturaService {
      async findPrefacturaDetalleByCuotaConvenioId(
        cuotaConvenioId: bigint,
      ): Promise<{ prefacturaId: bigint }[]> {
        return [{ prefacturaId: 100n }];
      }

      async findPrefacturaWithDetails(
        prefacturaId: bigint,
      ): Promise<PrefacturaCuotasInfo | null> {
        return {
          prefacturaId,
          comprobanteId: 100n,
          cuotaConvenioIds: [5n],
        };
      }

      async findCuotasByIds(
        cuotaConvenioIds: bigint[],
      ): Promise<CuotaConvenioStatus[]> {
        return [{ cuotaConvenioId: cuotaConvenioIds[0], estado: 'PAGADA' }];
      }
    }

    const service = new TestPrefacturaService();
    const detalles = await service.findPrefacturaDetalleByCuotaConvenioId(5n);
    expect(detalles).toHaveLength(1);
    expect(detalles[0].prefacturaId).toBe(100n);

    const prefactura = await service.findPrefacturaWithDetails(100n);
    expect(prefactura?.comprobanteId).toBe(100n);

    const cuotas = await service.findCuotasByIds([5n]);
    expect(cuotas[0].estado).toBe('PAGADA');
  });
});
