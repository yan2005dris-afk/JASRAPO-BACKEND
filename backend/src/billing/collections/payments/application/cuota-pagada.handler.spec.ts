import { CuotaPagadaHandler } from './cuota-pagada.handler';
import type { PaymentRepository } from '../domain/repositories/payment.repository';
import type { SRIEmissionDispatcherService } from './sri-emission-dispatcher.service';

describe('CuotaPagadaHandler', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
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
    paymentRepository = {
      findPrefacturaDetalleByCuotaConvenioId: jest.fn(),
      findPrefacturaById: jest.fn(),
      findManyCuotaConvenio: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;
    sriDispatcher = {
      tryEmit: jest.fn().mockResolvedValue('EMITTED'),
    } as unknown as jest.Mocked<SRIEmissionDispatcherService>;

    handler = new CuotaPagadaHandler(paymentRepository, sriDispatcher);
  });

  it('should delegate to SRIEmissionDispatcherService when all cuotas are PAGADA', async () => {
    paymentRepository.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      mockPrefacturaDetalle(),
    ]);
    paymentRepository.findPrefacturaById.mockResolvedValue(mockPrefactura());
    paymentRepository.findManyCuotaConvenio.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
      { cuotaConvenioId: 6n, estado: 'PAGADA' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(200n);
  });

  it('should NOT delegate when some cuotas are still not PAGADA', async () => {
    paymentRepository.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      mockPrefacturaDetalle(),
    ]);
    paymentRepository.findPrefacturaById.mockResolvedValue(mockPrefactura());
    paymentRepository.findManyCuotaConvenio.mockResolvedValue([
      { cuotaConvenioId: 5n, estado: 'PAGADA' },
      { cuotaConvenioId: 6n, estado: 'PENDIENTE' },
    ]);

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should gracefully no-op when no PrefacturaDetalle is found', async () => {
    paymentRepository.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue(
      [],
    );

    await handler.procesarCuotaPagada(999n);

    expect(paymentRepository.findPrefacturaById).not.toHaveBeenCalled();
    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should no-op when Prefactura has no comprobanteId', async () => {
    paymentRepository.findPrefacturaDetalleByCuotaConvenioId.mockResolvedValue([
      mockPrefacturaDetalle(),
    ]);
    paymentRepository.findPrefacturaById.mockResolvedValue(
      mockPrefactura({ comprobanteId: null }),
    );

    await handler.procesarCuotaPagada(5n);

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });
});
