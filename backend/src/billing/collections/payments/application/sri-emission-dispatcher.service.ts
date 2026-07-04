import { Injectable, Inject } from '@nestjs/common';
import { ComprobanteEstado } from 'src/sri/emision/domain/constants/comprobante-estado.enum';
import { SRI_EMISION_JOB } from 'src/sri/emision/infrastructure/queue/processors/sri-emision.constants';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import { ComprobanteRepository } from 'src/sri/emision/domain/repositories/comprobante.repository';
import { JobService } from '../domain/interfaces/job-service.interface';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { SriEmisionModeService } from 'src/sri/emision/application/services/sri-emision-mode.service';
import { AuditService } from 'src/infrastructure/audit/audit.service';

/**
 * Discriminated outcome of an emission attempt. The caller (e.g.
 * PagoValidadoHandler, CuotaPagadaHandler) can branch on this for logging or
 * metrics; production code should treat every non-EMITTED outcome as a
 * legitimate no-op.
 *
 * `QUEUED_FOR_MANUAL` — dispatcher parked the comprobante in `POR_EMITIR` and
 * did NOT enqueue an SRI job. Operator must trigger emission via the manual
 * endpoint.
 * `INVALID_STATE` — `tryEmitManual()` was called with a comprobante not in
 * `{BORRADOR, POR_EMITIR}`; controller maps this to 409.
 */
export type EmissionOutcome =
  | 'EMITTED'
  | 'ALREADY_EMITTED'
  | 'LOCK_LOST'
  | 'NOT_FOUND'
  | 'QUEUED_FOR_MANUAL'
  | 'INVALID_STATE';

/**
 * Single source of truth for "given a comprobante id, attempt emission".
 *
 * Both PagoValidadoHandler and CuotaPagadaHandler delegate to this service
 * instead of duplicating the BORRADOR-check + optimistic-lock + SRI job
 * enqueue sequence. A future trigger (e.g. `pago.anulado`) reuses the same
 * pipeline.
 *
 * Mode-aware (sdd/sri-emision-modo-manual-automatico):
 *   - automatico → existing BORRADOR → ENVIANDO + send path.
 *   - manual → BORRADOR → POR_EMITIR, no SRI call. Operator then calls
 *     `tryEmitManual()` via `POST /sri/comprobantes/:claveAcceso/emitir-manual`.
 *
 * The mode is read at TRANSITION TIME only — mid-flight sends keep the mode
 * they started with. 60s cache lag is acceptable.
 */
@LogContext()
@Injectable()
export class SRIEmissionDispatcherService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly comprobanteRepository: ComprobanteRepository,
    @Inject('JobService') private readonly jobsService: JobService,
    private readonly logger: LoggerService,
    private readonly sriEmisionModeService: SriEmisionModeService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Auto/manual dispatcher entry point. Picks the path based on the current
   * emission mode (read once at the top of the call).
   *
   * Preserves the original auto-mode outcomes (`EMITTED`, `ALREADY_EMITTED`,
   * `LOCK_LOST`, `NOT_FOUND`) by validating state BEFORE branching.
   */
  async tryEmit(comprobanteId: bigint): Promise<EmissionOutcome> {
    const comprobante = await this.paymentRepository.findUniqueComprobante({
      id: comprobanteId,
    });

    if (!comprobante) {
      this.logger.warn(`Comprobante ${comprobanteId} no encontrado`);
      return 'NOT_FOUND';
    }

    const mode = await this.sriEmisionModeService.getMode();

    if (mode === 'manual') {
      return this.tryParkForManual(comprobanteId, comprobante);
    }

    // Auto path — preserve original ALREADY_EMITTED semantics when state != BORRADOR.
    if (comprobante.estado !== ComprobanteEstado.BORRADOR) {
      this.logger.log(
        `Comprobante ${comprobanteId} no está en BORRADOR (estado=${comprobante.estado}), saltando emisión`,
      );
      return 'ALREADY_EMITTED';
    }

    return this.tryEmitWithRevert(comprobanteId, comprobante.estado);
  }

  /**
   * Operator-triggered emission. Accepts comprobantes in `{BORRADOR, POR_EMITIR}`.
   * Any other state → `INVALID_STATE` (controller maps to 409).
   */
  async tryEmitManual(comprobanteId: bigint): Promise<EmissionOutcome> {
    const comprobante = await this.paymentRepository.findUniqueComprobante({
      id: comprobanteId,
    });

    if (!comprobante) {
      this.logger.warn(`Comprobante ${comprobanteId} no encontrado`);
      return 'NOT_FOUND';
    }

    const allowedFrom: ReadonlyArray<string> = [
      ComprobanteEstado.BORRADOR,
      ComprobanteEstado.POR_EMITIR,
    ];
    if (!allowedFrom.includes(comprobante.estado)) {
      this.logger.log(
        `tryEmitManual: comprobante ${comprobanteId} no está en {BORRADOR,POR_EMITIR} (estado=${comprobante.estado})`,
      );
      return 'INVALID_STATE';
    }

    return this.tryEmitWithRevert(comprobanteId, comprobante.estado, 'manual');
  }

  // ─── Manual-mode dispatcher branch ─────────────────────────────────────

  /**
   * Manual mode: do NOT call SRI. Park the comprobante at `POR_EMITIR`.
   * Returns `QUEUED_FOR_MANUAL`. Audit row records the transition.
   */
  private async tryParkForManual(
    comprobanteId: bigint,
    comprobante: { estado: string },
  ): Promise<EmissionOutcome> {
    if (comprobante.estado !== ComprobanteEstado.BORRADOR) {
      this.logger.log(
        `Comprobante ${comprobanteId} no está en BORRADOR (estado=${comprobante.estado}), saltando parqueo`,
      );
      return 'ALREADY_EMITTED';
    }

    const locked = await this.comprobanteRepository.updateEstadoWithLock(
      comprobanteId,
      ComprobanteEstado.BORRADOR,
      ComprobanteEstado.POR_EMITIR,
    );

    if (!locked) {
      this.logger.warn(
        `Comprobante ${comprobanteId}: optimistic lock falló al parquear (manual)`,
      );
      return 'LOCK_LOST';
    }

    await this.auditService.log({
      accion: 'parqueado-manual',
      recurso: 'comprobante',
      recursoId: comprobanteId.toString(),
      exitoso: true,
      metadata: {
        comprobanteId: comprobanteId.toString(),
        previousState: ComprobanteEstado.BORRADOR,
        newState: ComprobanteEstado.POR_EMITIR,
      },
    });

    this.logger.log(
      `Comprobante ${comprobanteId}: parqueado en POR_EMITIR (modo=manual)`,
    );

    return 'QUEUED_FOR_MANUAL';
  }

  // ─── Shared send + revert helper ───────────────────────────────────────

  /**
   * Shared `{BORRADOR|POR_EMITIR} → ENVIANDO` + send-with-revert helper used by
   * both `tryEmit()` (auto path) and `tryEmitManual()`. Extracted to prevent
   * divergent revert logic between the two paths.
   *
   * @param comprobanteId      BigInt id of the comprobante.
   * @param expectedFromEstado State the comprobante MUST be in to acquire the lock.
   * @param origen             Tag sent in the job payload so the SRI processor can
   *                           distinguish manual vs. automatic emissions.
   */
  private async tryEmitWithRevert(
    comprobanteId: bigint,
    expectedFromEstado: string,
    origen: 'auto' | 'manual' = 'auto',
  ): Promise<EmissionOutcome> {
    const locked = await this.comprobanteRepository.updateEstadoWithLock(
      comprobanteId,
      expectedFromEstado,
      ComprobanteEstado.ENVIANDO,
    );

    if (!locked) {
      this.logger.warn(
        `Comprobante ${comprobanteId}: optimistic lock falló (desde ${expectedFromEstado}), otro proceso ganó la carrera`,
      );
      return 'LOCK_LOST';
    }

    try {
      await this.jobsService.send(SRI_EMISION_JOB, {
        tipo: 'FACTURA_DESDE_PREFACTURA',
        comprobanteId,
        origen,
      });
    } catch (err) {
      try {
        await this.comprobanteRepository.updateEstadoWithLock(
          comprobanteId,
          ComprobanteEstado.ENVIANDO,
          expectedFromEstado,
        );
      } catch (revertErr) {
        this.logger.error(
          `Revert failed for comprobante ${comprobanteId} (to ${expectedFromEstado})`,
          revertErr,
        );
      }
      throw err;
    }

    this.logger.log(
      `Comprobante ${comprobanteId}: emitido vía SRIEmissionDispatcherService (origen=${origen}), job sri-emision encolado`,
    );

    return 'EMITTED';
  }
}
