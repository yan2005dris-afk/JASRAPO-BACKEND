import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { PaymentEntity } from '../../domain/entities/payment.entity';

@Injectable()
export class FindOnePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(pagoId: bigint): Promise<PaymentEntity> {
    const pago = await this.paymentRepository.findById(pagoId);

    if (!pago || pago.deletedAt) {
      throw new NotFoundException(`Pago con ID ${pagoId} no encontrado`);
    }

    return pago;
  }
}
