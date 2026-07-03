import { BadRequestException } from '@nestjs/common';
import { EstadoPago } from 'src/generated/prisma/enums';
import { ValidatePaymentUseCase } from './validate-payment.use-case';

describe('ValidatePaymentUseCase', () => {
  const repository = {
    updatePago: jest.fn(),
    updateManyPagos: jest.fn(),
    findUniquePago: jest.fn(),
  };
  const findOne = { execute: jest.fn() };
  const annul = { execute: jest.fn() };
  let useCase: ValidatePaymentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ValidatePaymentUseCase(repository as any, findOne as any, annul as any);
  });

  it('should allow PENDIENTE to REGISTRADO', async () => {
    findOne.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.PENDIENTE });
    repository.updateManyPagos.mockResolvedValue({ count: 1 });
    repository.findUniquePago.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.REGISTRADO });

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

  it('should throw BadRequestException when transitioning to same state', async () => {
    findOne.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.PENDIENTE });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.PENDIENTE }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject invalid transition REGISTRADO → PENDIENTE', async () => {
    findOne.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.REGISTRADO });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.PENDIENTE }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should allow PENDIENTE → ANULADO via delegation to annul', async () => {
    findOne.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.PENDIENTE });
    annul.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.ANULADO });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.ANULADO, motivo: 'cancel' }, 'admin'),
    ).resolves.toMatchObject({ estadoPago: EstadoPago.ANULADO });

    expect(annul.execute).toHaveBeenCalledWith(1n, { motivoAnulacion: 'cancel', anuladoPor: 'admin' });
  });

  it('should throw BadRequestException on concurrent modification (count = 0)', async () => {
    findOne.execute.mockResolvedValue({ pagoId: 1n, estadoPago: EstadoPago.PENDIENTE });
    repository.updateManyPagos.mockResolvedValue({ count: 0 });

    await expect(
      useCase.execute(1n, { estadoPago: EstadoPago.REGISTRADO }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
