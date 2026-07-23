// Mock AuditService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../../../../infrastructure/audit/audit.service', () => ({
  AuditService: jest.fn(),
}));
import { PagoValidadoHandler } from './pago-validado.handler';
import type { SRIEmissionDispatcherService } from './sri-emission-dispatcher.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('PagoValidadoHandler (T-006, post-refactor RF-002)', () => {
  let handler: PagoValidadoHandler;
  let paymentRepository: any;
  let sriDispatcher: jest.Mocked<SRIEmissionDispatcherService>;

  beforeEach(() => {
    paymentRepository = {
      findManyDetallePago: jest.fn(),
      findUniqueComprobante: jest.fn(),
    };

    sriDispatcher = {
      tryEmit: jest.fn(),
    } as unknown as jest.Mocked<SRIEmissionDispatcherService>;

    handler = new PagoValidadoHandler(
      paymentRepository,
      sriDispatcher,
      mockLogger,
    );
  });

  function createDetallePago(overrides = {}) {
    return {
      detallePagoId: BigInt(1),
      pagoId: BigInt(1),
      comprobanteId: BigInt(42),
      tipoPago: 'COMPROBANTE',
      montoAbonado: 100,
      ...overrides,
    };
  }

  it('should delegate to sriDispatcher.tryEmit when pago completes the total (single comprobante)', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 60 }),
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 40 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(BigInt(42));
  });

  it('should NOT delegate when pago does NOT complete the total', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 30 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should NOT delegate when comprobante is missing (handler short-circuits before tryEmit)', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue(null);

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should handle multiple comprobantes across detalle_pago (W-6)', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 60 }),
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 40 }),
      createDetallePago({ comprobanteId: BigInt(99), montoAbonado: 200 }),
    ]);
    paymentRepository.findUniqueComprobante
      .mockResolvedValueOnce({ id: BigInt(42), importeTotal: 100 })
      .mockResolvedValueOnce({ id: BigInt(99), importeTotal: 200 });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    await handler.procesarPagoValidado(BigInt(1));

    // Both comprobantes should get dispatched (one per unique comprobanteId).
    expect(sriDispatcher.tryEmit).toHaveBeenCalledTimes(2);
    expect(sriDispatcher.tryEmit).toHaveBeenNthCalledWith(1, BigInt(42));
    expect(sriDispatcher.tryEmit).toHaveBeenNthCalledWith(2, BigInt(99));
  });

  it('should handle empty detalle_pago gracefully', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([]);

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should not include detalle_pago without comprobanteId', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: null, montoAbonado: 100 }),
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 50 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 50,
    });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).toHaveBeenCalledTimes(1);
    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(BigInt(42));
  });

  // RF-003 — C1 fix: handler must sum ALL active detalle_pago for the comprobante,
  // not only those of the current pago. Scenario: pago1=$60 then pago2=$40 → emit.
  it('RF-003 — should sum ALL active detalle_pago for the comprobanteId (multi-pago)', async () => {
    paymentRepository.findManyDetallePago.mockImplementation(
      async (params: any) => {
        if (params?.where?.pagoId === BigInt(2)) {
          return [
            createDetallePago({
              pagoId: BigInt(2),
              comprobanteId: BigInt(42),
              montoAbonado: 40,
            }),
          ];
        }
        if (params?.where?.pagoId === BigInt(1)) {
          return [
            createDetallePago({
              pagoId: BigInt(1),
              comprobanteId: BigInt(42),
              montoAbonado: 60,
            }),
          ];
        }
        if (params?.where?.comprobanteId === BigInt(42)) {
          return [
            createDetallePago({
              pagoId: BigInt(1),
              comprobanteId: BigInt(42),
              montoAbonado: 60,
            }),
            createDetallePago({
              pagoId: BigInt(2),
              comprobanteId: BigInt(42),
              montoAbonado: 40,
            }),
          ];
        }
        return [];
      },
    );
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    await handler.procesarPagoValidado(BigInt(2));

    expect(paymentRepository.findManyDetallePago).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ comprobanteId: BigInt(42) }),
      }),
    );
    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(BigInt(42));
  });

  it('RF-003 — should NOT delegate when cumulative sum across pagos is below total', async () => {
    paymentRepository.findManyDetallePago.mockImplementation(
      async (params: any) => {
        if (params?.where?.pagoId === BigInt(2)) {
          return [
            createDetallePago({
              pagoId: BigInt(2),
              comprobanteId: BigInt(42),
              montoAbonado: 40,
            }),
          ];
        }
        if (params?.where?.comprobanteId === BigInt(42)) {
          // pago1=$30 + pago2=$40 = $70 < $100 → still pending
          return [
            createDetallePago({
              pagoId: BigInt(1),
              comprobanteId: BigInt(42),
              montoAbonado: 30,
            }),
            createDetallePago({
              pagoId: BigInt(2),
              comprobanteId: BigInt(42),
              montoAbonado: 40,
            }),
          ];
        }
        return [];
      },
    );
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });

    await handler.procesarPagoValidado(BigInt(2));

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  // RF-002 — outcome from dispatcher is logged but does not affect handler flow.
  it('RF-002 — handler accepts all dispatcher outcomes without re-attempting', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });

    // Simulate a race-lost scenario.
    sriDispatcher.tryEmit.mockResolvedValueOnce('LOCK_LOST');
    await handler.procesarPagoValidado(BigInt(1));
    expect(sriDispatcher.tryEmit).toHaveBeenCalledTimes(1);

    // Simulate an already-emitted scenario on a fresh handler.
    sriDispatcher.tryEmit.mockResolvedValueOnce('ALREADY_EMITTED');
    await handler.procesarPagoValidado(BigInt(1));
    expect(sriDispatcher.tryEmit).toHaveBeenCalledTimes(2);
  });
});
