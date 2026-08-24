// Mock AuditService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../../../../../infrastructure/audit/audit.service', () => ({
  AuditService: jest.fn(),
}));
import { PagoValidadoHandler } from './pago-validado.handler';
import type { SRIEmissionDispatcherService } from '../../../../../sri/emision/application/services/sri-emission-dispatcher.service';
import { PaymentDetailEntity } from '../../domain/entities/payment-detail.entity';

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
      findPaymentDetailsByPagoId: jest.fn(),
      findPaymentDetailsByComprobanteId: jest.fn(),
      findComprobanteById: jest.fn(),
    };

    sriDispatcher = {
      tryEmit: jest.fn(),
    } as unknown as jest.Mocked<SRIEmissionDispatcherService>;

    handler = new PagoValidadoHandler(
      paymentRepository,
      sriDispatcher,
      mockLogger as any,
    );
  });

  function createDetallePago(overrides = {}) {
    return new PaymentDetailEntity({
      detallePagoId: BigInt(1),
      pagoId: BigInt(1),
      comprobanteId: BigInt(42),
      tipoPago: 'COMPROBANTE',
      montoAbonado: 100,
      formaPagoId: 1,
      createdAt: new Date(),
      ...overrides,
    });
  }

  it('should delegate to sriDispatcher.tryEmit when pago completes the total (single comprobante)', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 60 }),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 60 }),
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 40 }),
    ]);
    paymentRepository.findComprobanteById.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(BigInt(42));
  });

  it('should NOT delegate when pago does NOT complete the total', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 30 }),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 30 }),
    ]);
    paymentRepository.findComprobanteById.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should NOT delegate when comprobante is missing', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findComprobanteById.mockResolvedValue(null);

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should handle multiple comprobantes across detalle_pago (W-6)', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
      createDetallePago({ comprobanteId: BigInt(99), montoAbonado: 200 }),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId
      .mockResolvedValueOnce([
        createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
      ])
      .mockResolvedValueOnce([
        createDetallePago({ comprobanteId: BigInt(99), montoAbonado: 200 }),
      ]);
    paymentRepository.findComprobanteById
      .mockResolvedValueOnce({ id: BigInt(42), importeTotal: 100 })
      .mockResolvedValueOnce({ id: BigInt(99), importeTotal: 200 });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).toHaveBeenCalledTimes(2);
    expect(sriDispatcher.tryEmit).toHaveBeenNthCalledWith(1, BigInt(42));
    expect(sriDispatcher.tryEmit).toHaveBeenNthCalledWith(2, BigInt(99));
  });

  it('should handle empty detalle_pago gracefully', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([]);

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });

  it('should not include detalle_pago without comprobanteId', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago({ comprobanteId: null, montoAbonado: 100 }),
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 50 }),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 50 }),
    ]);
    paymentRepository.findComprobanteById.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 50,
    });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).toHaveBeenCalledTimes(1);
    expect(sriDispatcher.tryEmit).toHaveBeenCalledWith(BigInt(42));
  });

  it('should transition contract to PENDIENTE_INSTALACION when prefactura has installation rubro', async () => {
    const mockTx = {
      prefacturas: {
        findMany: jest.fn().mockResolvedValue([
          {
            prefacturaId: BigInt(10),
            contratoId: BigInt(99),
            prefacturaDetalle: [{ prefacturaDetalleId: BigInt(1) }],
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      contratos: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    paymentRepository.executeTransaction = jest
      .fn()
      .mockImplementation(async (cb) => {
        return cb(mockTx);
      });

    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findComprobanteById.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    await handler.procesarPagoValidado(BigInt(1));

    expect(mockTx.prefacturas.updateMany).toHaveBeenCalledWith({
      where: { comprobanteId: BigInt(42), deletedAt: null },
      data: {
        estado: 'PAGADA',
        saldoActual: 0,
        saldoVencido: 0,
        abono: 100,
      },
    });
    expect(mockTx.contratos.updateMany).toHaveBeenCalledWith({
      where: {
        contratoId: { in: [BigInt(99)] },
        estado: 'PENDIENTE_PAGO',
        deletedAt: null,
      },
      data: {
        estado: 'PENDIENTE_INSTALACION',
      },
    });
  });

  it('should be idempotent when called twice for the same payment/comprobante', async () => {
    const mockTx = {
      prefacturas: {
        findMany: jest.fn().mockResolvedValue([
          {
            prefacturaId: BigInt(10),
            contratoId: BigInt(99),
            prefacturaDetalle: [{ prefacturaDetalleId: BigInt(1) }],
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      contratos: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    paymentRepository.executeTransaction = jest
      .fn()
      .mockImplementation(async (cb) => cb(mockTx));

    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findComprobanteById.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
    });
    sriDispatcher.tryEmit.mockResolvedValue('EMITTED');

    // First call
    await handler.procesarPagoValidado(BigInt(1));
    // Second call (retry)
    await handler.procesarPagoValidado(BigInt(1));

    expect(sriDispatcher.tryEmit).toHaveBeenCalledTimes(2);
    expect(mockTx.prefacturas.updateMany).toHaveBeenCalledTimes(2);
    expect(mockTx.contratos.updateMany).toHaveBeenCalledTimes(2);
  });
});
