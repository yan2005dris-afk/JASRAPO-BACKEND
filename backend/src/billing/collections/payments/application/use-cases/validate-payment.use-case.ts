import { BadRequestException, Injectable } from '@nestjs/common';
import { EstadoPago } from '../../domain/enums';
import { UpdatePaymentStateDto } from '../../interfaces/dto/update-payment-state.dto';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';
import { FindOnePaymentUseCase } from './find-one-payment.use-case';
import { AnnulPaymentUseCase } from './annul-payment.use-case';
import type { PaymentEntity } from '../../domain/entities/payment.entity';

const VALID_TRANSITIONS: Record<EstadoPago, EstadoPago[]> = {
  [EstadoPago.PENDIENTE]: [EstadoPago.REGISTRADO, EstadoPago.ANULADO],
  [EstadoPago.REGISTRADO]: [EstadoPago.ANULADO],
  [EstadoPago.ANULADO]: [],
};

@Injectable()
export class ValidatePaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly eventosPendientesRepository: EventosPendientesRepository,
    private readonly findOneUseCase: FindOnePaymentUseCase,
    private readonly annulPaymentUseCase: AnnulPaymentUseCase,
  ) {}

  async execute(
    pagoId: bigint,
    dto: UpdatePaymentStateDto,
    actualizadoPor = 'SYSTEM',
  ): Promise<PaymentEntity> {
    const pago = await this.findOneUseCase.execute(pagoId);

    if (dto.estadoPago === EstadoPago.ANULADO) {
      return this.annulPaymentUseCase.execute(pagoId, {
        motivoAnulacion: dto.motivo || 'Anulado desde actualización de estado',
        anuladoPor: actualizadoPor,
      });
    }

    const current = pago.estadoPago as EstadoPago;
    const allowed = VALID_TRANSITIONS[current] ?? [];

    if (!allowed.includes(dto.estadoPago)) {
      throw new BadRequestException(
        `Transición no permitida: de ${current} a ${dto.estadoPago}`,
      );
    }

    await this.paymentRepository.executeTransaction(async (tx) => {
      await this.paymentRepository.updatePagoState(
        pagoId,
        dto.estadoPago,
        dto.motivo
          ? `${pago.observaciones ? pago.observaciones + ' | ' : ''}${dto.motivo}`
          : undefined,
        tx,
      );

      await this.eventosPendientesRepository.createPending(
        'pago.validado',
        {
          pagoId: pagoId.toString(),
          estadoPago: dto.estadoPago,
          actualizadoPor,
        },
        'PAGO',
        pagoId.toString(),
        tx as any,
      );
    });

    return (await this.paymentRepository.findById(pagoId))!;
  }
}
