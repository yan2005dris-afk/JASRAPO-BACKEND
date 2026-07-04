import { CuotaPagadaHandler } from './cuota-pagada.handler';
import type { PrefacturaService } from '../domain/services/prefactura.service';
import type { SRIEmissionDispatcherService } from './sri-emission-dispatcher.service';

describe('CuotaPagadaHandler', () => {
  let prefacturaService: jest.Mocked<PrefacturaService>;
  let sriDispatcher: jest.Mocked<SRIEmissionDispatcherService>;
  let handler: CuotaPagadaHandler;

  const mockPrefacturaDetalle = (overrides = {}) => ({
    prefacturaDetalleId: 10n,
    prefacturaId: 100n,
    cuotaConvenioId: 5n,
    rubroId: 1,
    descripcion: 'Cuota test',
    cantidad: 1,
    precioUnitario: 100,
    subtotal: 100,
    iva: 0,
    total: 100,
    codigoImpuestoSri: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    descuento: 0,
    codigoPorcentajeSri: null,
    tarifaImpuesto: 0,
    ...overrides,
  });

  const mockPrefactura = (overrides = {}) => ({
    prefacturaId: 100n,
    comprobanteId: 200n,
    totalPagar: 100,
    estado: 'APROBADA',
    prefacturaDetalle: [{ cuotaConvenioId: 5n }, { cuotaConvenioId: 6n }],
    ...overrides,
  });

  beforeEach(() => {
    prefacturaService = {
      findPrefacturaDetalleByCuotaConvenioId: jest.fn(),
      findPrefacturaById: jest.fn(),
      findManyCuotaConvenio: jest.fn(),
    };
    sriDispatcher = {
      tryEmit: jest.fn().mockResolvedValue('EMITTED'),
    } as unknown as jest.Mocked<SRIEmissionDispatcherService>;

    handler = new CuotaPagadaHandler(prefacturaService, sriDispatcher);
  });

  it('should delegate to SRIEmissionDispatcherService when all cuotas are PAGADA', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      mockPrefacturaDetalle(),
    ]);
    prefacturaService.findPrefacturaById.mockResolvedValue(mockPrefactura());
    prefacturaService.findManyCuotaConvenio.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
      { cuotaConvenioId: 6n, estado: 'PAGADA' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(200n);
  });

  it('should NOT delegate when some cuotas are still not PAGADA', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      mockPrefacturaDetalle(),
    ]);
    prefacturaService.findPrefacturaById.mockResolvedValue(mockPrefactura());
    prefacturaService.findManyCuotaConvenio.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
      { cuotaConvenioId: 6n, estado: 'PENDIENTE' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should gracefully no-op when no PrefacturaDetalle is found', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue(
      [],
    );

    await handler.procesarCuotaPagada(999n);

    expect(prefacturaService.findPrefacturaById).not.toHaveBeenCalled();
    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should no-op when Prefactura has no comprobanteId', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      mockPrefacturaDetalle(),
    ]);
    prefacturaService.findPrefacturaById.mockResolvedValue(
      mockPrefactura({ comprobanteId: null }),
    );

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  // ─── R-D.1: deletedAt: null filter ─────────────────────────────────────

  it('R-D.1: should include deletedAt: null in findManyCuotaConvenio query', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      mockPrefacturaDetalle(),
    ]);
    prefacturaService.findPrefacturaById.mockResolvedValue(mockPrefactura());
    prefacturaService.findManyCuotaConvenio.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(prefacturaService.findManyCuotaConvenio).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: null }),
      expect.any(Object),
    );
  });

  it('R-D.1: should exclude soft-deleted cuotas from "all paid" check', async () => {
    prefacturaService.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      mockPrefacturaDetalle(),
    ]);
    prefacturaService.findPrefacturaById.mockResolvedValue(mockPrefactura());
    // Only 5n is returned (6n is soft-deleted, excluded by deletedAt: null)
    prefacturaService.findManyCuotaConvenio.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
    ]);

    await handler.procesarCuotaPagada(5n);

    // Both filtered cuotas are PAGADA → emission proceeds
    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(200n);
  });
});
