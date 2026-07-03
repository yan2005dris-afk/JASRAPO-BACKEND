import { BadRequestException, Injectable } from '@nestjs/common';
import { EstadoPago } from '../../domain/enums';
import { UpdatePaymentStateDto } from '../../interfaces/dto/update-payment-state.dto';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';
import { safePaymentWithDetailSelect } from '../../domain/types/IPayment';
import { FindOnePaymentUseCase } from './find-one-payment.use-case';
import { AnnulPaymentUseCase } from './annul-payment.use-case';

const VALID_TRANSITIONS: Record<EstadoPago, EstadoPago[]> = {
  [EstadoPago.PENDIENTE]: [EstadoPago.REGISTRADO, EstadoPago.ANULADO],
  [EstadoPago.REGISTRADO]: [EstadoPago.ANULADO],
  [EstadoPago.ANULADO]: [],
};

/**
 * W-3: the pago.validado outbox row is written inside the same transaction as
 * `updateManyPagos`. A crash between the two writes would have lost the
 * comprobante emission in the old `EventEmitter2.emit()` design — now the
 * outbox row stays PENDIENTE and the OutboxProcessor retries asynchronously.
 */
@Injectable()
export class ValidatePaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly findOnePaymentUseCase: FindOnePaymentUseCase,
    private readonly annulPaymentUseCase: AnnulPaymentUseCase,
    private readonly eventosPendientesRepository: EventosPendientesRepository,
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

    await this.paymentRepository.executeTransaction(async (tx) => {
      const r = await this.paymentRepository.updateManyPagos(
        { pagoId, estadoPago: estadoActual, deletedAt: null },
        { estadoPago: dto.estadoPago },
        tx,
      );

      if (r.count === 0) {
        throw new BadRequestException(
          `El pago ${pagoId} fue modificado por otra solicitud`,
        );
      }

      // Write the outbox row inside the SAME tx. If this throws, the
      // surrounding $transaction rolls back and the pago state is not
      // updated — atomicity is what makes the outbox pattern durable.
      await this.eventosPendientesRepository.createPending(
        'pago.validado',
        {
          pagoId: pagoId.toString(),
          estadoPago: dto.estadoPago,
          actualizadoPor,
        },
        'PAGO',
        pagoId.toString(),
        tx,
      );
    });

    return this.paymentRepository.findUniquePago(
      { pagoId },
      safePaymentWithDetailSelect,
    );
  }
}
