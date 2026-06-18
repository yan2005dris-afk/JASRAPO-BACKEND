import { Test, TestingModule } from '@nestjs/testing';
import { EstadoPago } from 'src/generated/prisma/enums';
import { PaymentsService } from './payments.service';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { FindOnePaymentUseCase } from './use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './use-cases/apply-saldo-favor.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  const createUseCase = { execute: jest.fn() };
  const findOneUseCase = { execute: jest.fn() };
  const validatePaymentUseCase = { execute: jest.fn() };
  const annulPaymentUseCase = { execute: jest.fn() };
  const applySaldoFavorUseCase = { execute: jest.fn() };
  const prisma = {
    pagos: { count: jest.fn(), findMany: jest.fn() },
    saldoFavorCliente: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CreatePaymentUseCase, useValue: createUseCase },
        { provide: FindOnePaymentUseCase, useValue: findOneUseCase },
        { provide: ValidatePaymentUseCase, useValue: validatePaymentUseCase },
        { provide: AnnulPaymentUseCase, useValue: annulPaymentUseCase },
        { provide: ApplySaldoFavorUseCase, useValue: applySaldoFavorUseCase },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  it('should return payment states', async () => {
    await expect(service.findPaymentStates()).resolves.toContainEqual({
      codigo: EstadoPago.PENDIENTE,
    });
  });

  it('should delegate create and map response', async () => {
    createUseCase.execute.mockResolvedValue({
      pagoId: 1n,
      clienteId: 1n,
      cajaId: null,
      banco: null,
      comprobanteUrl: null,
      fechaPago: new Date('2026-06-18'),
      montoTotalRecibido: 10,
      numeroOperacion: null,
      observaciones: null,
      referenciaBanco: null,
      estadoPago: EstadoPago.PENDIENTE,
      creadoPor: 'tester',
      anuladoPor: null,
      fechaAnulacion: null,
      motivoAnulacion: null,
      createdAt: new Date('2026-06-18'),
      updatedAt: new Date('2026-06-18'),
      detallePago: [],
    });

    const result = await service.create({
      clienteId: '1',
      fechaPago: '2026-06-18',
      montoTotalRecibido: 10,
      detalle: [
        { tipoPago: 'PAGO_LIBRE' as any, montoAbonado: 10, formaPagoId: 1 },
      ],
    }, 'tester');

    expect(createUseCase.execute).toHaveBeenCalled();
    expect(result.pagoId).toBe('1');
  });
});
