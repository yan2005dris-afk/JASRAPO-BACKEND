import { BadRequestException, Injectable } from '@nestjs/common';
import { EstadoPago } from 'src/generated/prisma/enums';
import { UpdatePaymentStateDto } from '../../interfaces/dto/update-payment-state.dto';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { safePaymentWithDetailSelect } from '../../domain/types/IPayment';
import { FindOnePaymentUseCase } from './find-one-payment.use-case';
import { AnnulPaymentUseCase } from './annul-payment.use-case';

const VALID_TRANSITIONS: Record<EstadoPago, EstadoPago[]> = {
  [EstadoPago.PENDIENTE]: [EstadoPago.REGISTRADO, EstadoPago.ANULADO],
  [EstadoPago.REGISTRADO]: [EstadoPago.ANULADO],
  [EstadoPago.ANULADO]: [],
};

@Injectable()
export class ValidatePaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly findOnePaymentUseCase: FindOnePaymentUseCase,
    private readonly annulPaymentUseCase: AnnulPaymentUseCase,
  ) {}

  async execute(pagoId: bigint, dto: UpdatePaymentStateDto, actualizadoPor = 'SYSTEM') {
    const pago = await this.findOnePaymentUseCase.execute(pagoId);
    const estadoActual = pago.estadoPago as EstadoPago;

    if (estadoActual === dto.estadoPago) {
      throw new BadRequestException(
        `El pago ya se encuentra en estado ${dto.estadoPago}`,
      );
    }

    if (!VALID_TRANSITIONS[estadoActual].includes(dto.estadoPago)) {
      throw new BadRequestException(
        `Transición inválida: ${estadoActual} → ${dto.estadoPago}`,
      );
    }

    if (dto.estadoPago === EstadoPago.ANULADO) {
      return this.annulPaymentUseCase.execute(pagoId, {
        motivoAnulacion: dto.motivo ?? '',
        anuladoPor: actualizadoPor,
      });
    }

    return this.paymentRepository.updatePago(
      { pagoId },
      { estadoPago: dto.estadoPago },
      safePaymentWithDetailSelect,
    );
  }
}
