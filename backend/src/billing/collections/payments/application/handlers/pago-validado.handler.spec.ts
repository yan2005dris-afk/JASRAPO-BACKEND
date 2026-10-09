// Mock AuditService to prevent loading JobsService (which pulls in pg-boss ESM)
jest.mock('../../../../../infrastructure/audit/audit.service', () => ({
  AuditService: jest.fn(),
}));
import { PagoValidadoHandler } from './pago-validado.handler';
import type { SRIEmissionDispatcherService } from '../../../../../sri/emision/application/services/sri-emission-dispatcher.service';
import { PaymentDetailRow } from '../../domain/types/payment.types';
import { paymentDetailRow } from '../../__test-utils__/payment-row.factory';

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
      settlePaidComprobante: jest.fn(),
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
    return paymentDetailRow({
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
    expect(paymentRepository.settlePaidComprobante).not.toHaveBeenCalled();
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
    expect(paymentRepository.settlePaidComprobante).not.toHaveBeenCalled();
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
    expect(paymentRepository.settlePaidComprobante).not.toHaveBeenCalled();
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

  it('settles before emission and handles decimal payments exactly', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago(),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId.mockResolvedValue([
      createDetallePago({ montoAbonado: 0.1 }),
      createDetallePago({ montoAbonado: 0.7 }),
    ]);
    paymentRepository.findComprobanteById.mockResolvedValue({
      importeTotal: 0.8,
    });
    await handler.procesarPagoValidado(1n);
    expect(paymentRepository.settlePaidComprobante).toHaveBeenCalledWith(
      42n,
      0.8,
    );
    expect(
      paymentRepository.settlePaidComprobante.mock.invocationCallOrder[0],
    ).toBeLessThan(sriDispatcher.tryEmit.mock.invocationCallOrder[0]);
  });

  it('does not emit if settling the installation fails', async () => {
    paymentRepository.findPaymentDetailsByPagoId.mockResolvedValue([
      createDetallePago(),
    ]);
    paymentRepository.findPaymentDetailsByComprobanteId.mockResolvedValue([
      createDetallePago(),
    ]);
    paymentRepository.findComprobanteById.mockResolvedValue({
      importeTotal: 100,
    });
    paymentRepository.settlePaidComprobante.mockRejectedValue(
      new Error('Installation unavailable'),
    );
    await expect(handler.procesarPagoValidado(1n)).rejects.toThrow(
      'Installation unavailable',
    );
    expect(sriDispatcher.tryEmit).not.toHaveBeenCalled();
  });
});
