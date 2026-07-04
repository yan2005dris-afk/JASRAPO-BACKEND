import { Injectable, Logger, Inject } from '@nestjs/common';
import { ComprobanteEstado } from 'src/sri/emision/domain/constants/comprobante-estado.enum';
import { SRI_EMISION_JOB } from 'src/sri/emision/infrastructure/queue/processors/sri-emision.constants';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import { ComprobanteRepository } from 'src/sri/emision/domain/repositories/comprobante.repository';
import type { JobService } from './pago-validado.handler';

/**
 * Discriminated outcome of an emission attempt. The caller (e.g.
 * PagoValidadoHandler, CuotaPagadaHandler) can branch on this for logging or
 * metrics; production code should treat every non-EMITTED outcome as a
 * legitimate no-op.
 */
export type EmissionOutcome =
  | 'EMITTED'
  | 'ALREADY_EMITTED'
  | 'LOCK_LOST'
  | 'NOT_FOUND';

/**
 * Single source of truth for "given a comprobante id, attempt emission".
 *
 * Both PagoValidadoHandler and CuotaPagadaHandler delegate to this service
 * instead of duplicating the BORRADOR-check + optimistic-lock + SRI job
 * enqueue sequence. A future trigger (e.g. `pago.anulado`) reuses the same
 * pipeline.
 *
 * Important: this service does NOT decide whether the comprobante is fully
 * paid — that responsibility stays with the caller, which knows the context
 * (e.g. totalAbonado summed from DetallePago records). Here we only decide:
 * (a) does the comprobante exist? (b) is it still in BORRADOR? (c) can we
 * atomically transition it to ENVIANDO? (d) enqueue the SRI job.
 */
@Injectable()
export class SRIEmissionDispatcherService {
  private readonly logger = new Logger(SRIEmissionDispatcherService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly comprobanteRepository: ComprobanteRepository,
    @Inject('JobService') private readonly jobsService: JobService,
  ) {}

  async tryEmit(comprobanteId: bigint): Promise<EmissionOutcome> {
    const comprobante = await this.paymentRepository.findUniqueComprobante({
      id: comprobanteId,
    });

    if (!comprobante) {
      this.logger.warn(`Comprobante ${comprobanteId} no encontrado`);
      return 'NOT_FOUND';
    }

    if (comprobante.estado !== ComprobanteEstado.BORRADOR) {
      this.logger.log(
        `Comprobante ${comprobanteId} no está en BORRADOR (estado=${comprobante.estado}), saltando emisión`,
      );
      return 'ALREADY_EMITTED';
    }

    const locked = await this.comprobanteRepository.updateEstadoWithLock(
      comprobanteId,
      ComprobanteEstado.BORRADOR,
      ComprobanteEstado.ENVIANDO,
    );

    if (!locked) {
      this.logger.warn(
        `Comprobante ${comprobanteId}: optimistic lock falló, otro proceso ganó la carrera`,
      );
      return 'LOCK_LOST';
    }

    await this.jobsService.send(SRI_EMISION_JOB, {
      tipo: 'FACTURA_DESDE_PREFACTURA',
      comprobanteId,
    });

    this.logger.log(
      `Comprobante ${comprobanteId}: emitido vía SRIEmissionDispatcherService, job sri-emision encolado`,
    );

    return 'EMITTED';
  }
}
