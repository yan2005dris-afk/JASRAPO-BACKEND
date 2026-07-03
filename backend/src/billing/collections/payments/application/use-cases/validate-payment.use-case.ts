import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstadoPago } from '../../domain/enums';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    pagoId: bigint,
    dto: UpdatePaymentStateDto,
    actualizadoPor = 'SYSTEM',
  ) {
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

    const result = await this.paymentRepository.updateManyPagos(
      { pagoId, estadoPago: estadoActual, deletedAt: null },
      { estadoPago: dto.estadoPago },
    );

    if (result.count === 0) {
      throw new BadRequestException(
        `El pago ${pagoId} fue modificado por otra solicitud`,
      );
    }

    // Emit event so PagoValidadoHandler can check if comprobante is fully paid
    this.eventEmitter.emit('pago.validado', {
      pagoId,
      estadoPago: dto.estadoPago,
      actualizadoPor,
    });

    return this.paymentRepository.findUniquePago(
      { pagoId },
      safePaymentWithDetailSelect,
    );
  }
}
