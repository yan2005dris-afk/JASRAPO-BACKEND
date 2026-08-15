import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { ComprobanteRepository } from '../../../../sri/emision/domain/repositories/comprobante.repository';
import { ComprobanteEstado } from '../../../../sri/emision/domain/constants/comprobante-estado.enum';
import { STATE_TRANSITIONS } from '../../domain/constants/pre-invoice-states';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import type { PreInvoiceEntity } from '../../domain/entities/pre-invoice.entity';

@Injectable()
export class UpdatePreInvoiceStateUseCase {
  constructor(
    private readonly preInvoiceRepository: PreInvoiceRepository,
    @Inject(ComprobanteRepository)
    private readonly comprobanteRepository: ComprobanteRepository,
  ) {}

  async execute(params: {
    id: number;
    accion: string;
    userId?: string;
    motivoRechazo?: string;
  }): Promise<PreInvoiceEntity> {
    const { id, accion, userId, motivoRechazo } = params;

    const preInvoice = await this.preInvoiceRepository.findById(id);
    if (!preInvoice) {
      throw new EntityNotFoundException('Prefactura', id);
    }

    const currentState = preInvoice.estado;
    const allowedTransitions = STATE_TRANSITIONS[currentState];

    if (!allowedTransitions || !allowedTransitions.includes(accion)) {
      throw new InvalidDomainOperationException(
        `Cannot transition from ${currentState} to ${accion}. ` +
          `Allowed transitions: ${(allowedTransitions ?? []).join(', ') || 'none'}`,
      );
    }

    const normalizedRejectionReason = motivoRechazo?.trim() || undefined;

    if (accion === 'RECHAZADA' && !normalizedRejectionReason) {
      throw new InvalidDomainOperationException(
        'A rejection reason must be provided',
      );
    }

    const data: {
      aprobadaPor?: string;
      motivoRechazo?: string;
      fechaAprobacion?: Date;
      comprobanteId?: bigint;
    } = {};

    if (accion === 'APROBADA') {
      data.aprobadaPor = userId ?? 'SYSTEM';
      data.fechaAprobacion = new Date();

      // Create a BORRADOR comprobante and link it to the prefactura
      const comprobante = await this.comprobanteRepository.create({
        estado: ComprobanteEstado.BORRADOR,
        emisor_id: preInvoice.puntoEmision?.establecimiento?.emisor?.id ?? 0,
        punto_emision_id: preInvoice.puntoEmisionId ?? 0,
        tipo_comprobante: '01', // FACTURA
        ambiente: '1',
        tipo_emision: '1',
        secuencial: '',
        clave_acceso: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        importe_total: Number(preInvoice.totalPagar) || 0,
        receptor_identificacion: preInvoice.clienteIdentificacion ?? undefined,
        receptor_razon_social: preInvoice.clienteNombre ?? undefined,
        receptor_direccion: preInvoice.clienteDireccion ?? undefined,
        receptor_email: preInvoice.clienteEmail ?? undefined,
      });

      data.comprobanteId = comprobante.id;
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
      throw new InvalidDomainOperationException(
        'The pre-invoice changed state during the operation. Please try again.',
      );
    }

    const fresh = await this.preInvoiceRepository.findById(id);
    return fresh!;
  }
}
