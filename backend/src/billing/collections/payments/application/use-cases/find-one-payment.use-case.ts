import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { safePaymentWithDetailSelect } from '../../infrastructure/repositories/prisma-payment.repository';

@Injectable()
export class FindOnePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(pagoId: bigint) {
    const pago = await this.paymentRepository.findUniquePago(
      { pagoId },
      {
        ...safePaymentWithDetailSelect,
        deletedAt: true,
      },
    );

    if (!pago || pago.deletedAt) {
      throw new NotFoundException(`Pago con ID ${pagoId} no encontrado`);
    }

    return pago;
  }
}
