import { BadRequestException } from '@nestjs/common';
import { EstadoPago } from 'src/generated/prisma/enums';
import { ValidatePaymentUseCase } from './validate-payment.use-case';

describe('ValidatePaymentUseCase', () => {
  const repository = { updatePago: jest.fn() };
  const findOne = { execute: jest.fn() };
  const annul = { execute: jest.fn() };
  let useCase: ValidatePaymentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ValidatePaymentUseCase(repository as any, findOne as any, annul as any);
  });

  it('should allow PENDIENTE to REGISTRADO', async () => {
    findOne.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.PENDIENTE });
    repository.updatePago.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.REGISTRADO });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.REGISTRADO }),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.REGISTRADO });
  });

  it('should reject invalid transition from ANULADO', async () => {
    findOne.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.ANULADO });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should delegate annul transition', async () => {
    findOne.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.REGISTRADO });
    annul.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.ANULADO });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.ANULADO, motivo: 'error' }, 'admin'),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.ANULADO });
  });
});
