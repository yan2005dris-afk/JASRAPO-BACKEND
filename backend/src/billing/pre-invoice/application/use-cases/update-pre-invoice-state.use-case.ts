import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { STATE_TRANSITIONS } from '../pre-invoice-states';

@Injectable()
export class UpdatePreInvoiceStateUseCase {
  constructor(private readonly preInvoiceRepository: PreInvoiceRepository) {}

  async execute(params: {
    id: number;
    accion: string;
    userId?: string;
    motivoRechazo?: string;
  }) {
    const { id, accion, userId, motivoRechazo } = params;

    const preInvoice = await this.preInvoiceRepository.findById(id);
    if (!preInvoice) {
      throw new NotFoundException(`Pre-invoice ${id} not found`);
    }

    const currentState = preInvoice.estado;
    const allowedTransitions = STATE_TRANSITIONS[currentState];

    if (!allowedTransitions || !allowedTransitions.includes(accion)) {
      throw new BadRequestException(
        `Cannot transition from ${currentState} to ${accion}. ` +
          `Allowed transitions: ${(allowedTransitions ?? []).join(', ') || 'none'}`,
      );
    }

    const normalizedRejectionReason = motivoRechazo?.trim() || undefined;

    if (accion === 'RECHAZADA' && !normalizedRejectionReason) {
      throw new BadRequestException('A rejection reason must be provided');
    }

    const data: {
      aprobadaPor?: string;
      motivoRechazo?: string;
      fechaAprobacion?: Date;
    } = {};

    if (accion === 'APROBADA') {
      data.aprobadaPor = userId ?? 'SYSTEM';
      data.fechaAprobacion = new Date();
    }

    if (accion === 'RECHAZADA') {
      data.motivoRechazo = normalizedRejectionReason;
    }

    const updated = await this.preInvoiceRepository.updateState(
      id,
      accion,
      currentState,
      data,
    );
    if (!updated) {
      throw new BadRequestException(
        'The pre-invoice changed state during the operation. Please try again.',
      );
    }

    return this.preInvoiceRepository.findById(id);
  }
}
