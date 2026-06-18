import { Test, TestingModule } from '@nestjs/testing';
import { EstadoPago } from 'src/generated/prisma/enums';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../../application/payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateState: jest.fn(),
    annul: jest.fn(),
    findPaymentStates: jest.fn(),
    findBankCatalog: jest.fn(),
    findSaldoFavorByCliente: jest.fn(),
    applySaldoFavor: jest.fn(),
    getDailyCashSummary: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: service }],
    }).compile();

    controller = module.get(PaymentsController);
  });

  it('should list states', async () => {
    service.findPaymentStates.mockResolvedValue([{ codigo: EstadoPago.PENDIENTE }]);
    await expect(controller.findStates()).resolves.toEqual([{ codigo: EstadoPago.PENDIENTE }]);
  });

  it('should delegate create with current user', async () => {
    service.create.mockResolvedValue({ pagoId: '1' });
    await expect(
      controller.create(
        {
          clienteId: '1',
          fechaPago: '2026-06-18',
          montoTotalRecibido: 10,
          detalle: [{ tipoPago: 'PAGO_LIBRE' as any, montoAbonado: 10, formaPagoId: 1 }],
        },
        { email: 'admin@jasrapo.com' },
      ),
    ).resolves.toEqual({ pagoId: '1' });
    expect(service.create).toHaveBeenCalledWith(expect.any(Object), 'admin@jasrapo.com');
  });
});
