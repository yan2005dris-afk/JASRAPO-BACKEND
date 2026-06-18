import { NotFoundException } from '@nestjs/common';
import { FindOnePaymentUseCase } from './find-one-payment.use-case';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

describe('FindOnePaymentUseCase', () => {
  const repository = { findUniquePago: jest.fn() } as unknown as jest.Mocked<PaymentRepository>;
  const useCase = new FindOnePaymentUseCase(repository);

  beforeEach(() => jest.clearAllMocks());

  it('should return payment when it exists', async () => {
    repository.findUniquePago.mockResolvedValue({ pagoId: 1n, deletedAt: null });
    await expect(useCase.execute(1n)).resolves.toMatchObject({ pagoId: 1n });
  });

  it('should throw when payment does not exist', async () => {
    repository.findUniquePago.mockResolvedValue(null);
    await expect(useCase.execute(1n)).rejects.toBeInstanceOf(NotFoundException);
  });
});
