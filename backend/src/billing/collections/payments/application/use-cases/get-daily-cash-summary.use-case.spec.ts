import { GetDailyCashSummaryUseCase } from './get-daily-cash-summary.use-case';
import type { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import { PaymentDetailEntity } from '../../domain/entities/payment-detail.entity';

describe('GetDailyCashSummaryUseCase', () => {
  let useCase: GetDailyCashSummaryUseCase;
  let paymentRepository: jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    paymentRepository = {
      findDailyCashPayments: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;

    useCase = new GetDailyCashSummaryUseCase(paymentRepository);
  });

  it('should return daily cash summary with correct totals and breakdowns', async () => {
    paymentRepository.findDailyCashPayments.mockResolvedValue([
      new PaymentEntity({
        pagoId: 1n,
        montoTotalRecibido: 150,
        fechaPago: new Date('2026-06-18'),
        detallePago: [
          new PaymentDetailEntity({
            tipoPago: 'EFECTIVO',
            montoAbonado: 100,
            comprobante: { comprobanteId: '1', tipoComprobante: 'FACTURA' },
          }),
          new PaymentDetailEntity({
            tipoPago: 'TRANSFERENCIA',
            montoAbonado: 50,
            comprobante: { comprobanteId: '2', tipoComprobante: 'FACTURA' },
          }),
        ],
      }),
    ]);

    const result = await useCase.execute({ fecha: '2026-06-18' });

    expect(result.totalPagos).toBe(1);
    expect(result.totalRecaudado).toBe(150);
    expect(result.desglosePorTipoDetalle).toEqual(
      expect.arrayContaining([
        { codigo: 'EFECTIVO', total: 100 },
        { codigo: 'TRANSFERENCIA', total: 50 },
      ]),
    );
    expect(result.desglosePorTipoComprobante).toEqual(
      expect.arrayContaining([{ codigo: 'FACTURA', total: 150 }]),
    );
    expect(paymentRepository.findDailyCashPayments).toHaveBeenCalledWith({
      fechaInicio: new Date('2026-06-18T00:00:00.000Z'),
      fechaFin: new Date('2026-06-18T23:59:59.999Z'),
      cajaId: undefined,
    });
  });

  it('should filter by cajaId when provided', async () => {
    paymentRepository.findDailyCashPayments.mockResolvedValue([]);

    const result = await useCase.execute({
      fecha: '2026-06-18',
      cajaId: '5',
    });

    expect(result.cajaId).toBe('5');
    expect(result.totalPagos).toBe(0);
    expect(result.totalRecaudado).toBe(0);
    expect(paymentRepository.findDailyCashPayments).toHaveBeenCalledWith({
      fechaInicio: new Date('2026-06-18T00:00:00.000Z'),
      fechaFin: new Date('2026-06-18T23:59:59.999Z'),
      cajaId: 5n,
    });
  });

  it('should default to SIN_COMPROBANTE when comprobante is missing', async () => {
    paymentRepository.findDailyCashPayments.mockResolvedValue([
      new PaymentEntity({
        pagoId: 2n,
        montoTotalRecibido: 30,
        fechaPago: new Date('2026-06-18'),
        detallePago: [
          new PaymentDetailEntity({
            tipoPago: 'EFECTIVO',
            montoAbonado: 30,
            comprobante: null,
          }),
        ],
      }),
    ]);

    const result = await useCase.execute({ fecha: '2026-06-18' });

    expect(result.desglosePorTipoComprobante).toEqual([
      { codigo: 'SIN_COMPROBANTE', total: 30 },
    ]);
  });
});
