import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ComprobanteEstado } from '../../domain/constants/comprobante-estado.enum';
import { ComprobanteRepository } from '../../domain/repositories/comprobante.repository';
import {
  SRIEmissionDispatcherService,
  EmissionOutcome,
} from '../../../../billing/collections/payments/application/sri-emission-dispatcher.service';
import { AuditService } from '../../../../infrastructure/audit/audit.service';

/**
 * Shape of the auth principal as the controller hands it off.
 * `id` matches `auditoria.usuarioId` (Int?). The other fields are
 * optional; if missing, the audit row simply omits them.
 */
export interface EmitirManualCurrentUser {
  id: number;
  email?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * EmitirComprobanteManualUseCase
 *
 * Operator-triggered emission (sdd/sri-emision-modo-manual-automatico):
 *   1. Look up comprobante by `claveAcceso` — 404 if missing.
 *   2. Validate estado ∈ {BORRADOR, POR_EMITIR} — 409 otherwise.
 *   3. Delegate to `SRIEmissionDispatcherService.tryEmitManual()`.
 *   4. Write `AuditoriaSri` row (`accion='emision-manual'`).
 *
 * Used by `SriController.emitirManual()` which guards the call with
 * `@RequiredPermission('sri','admin')` at the class level.
 */
@Injectable()
export class EmitirComprobanteManualUseCase {
  constructor(
    private readonly comprobanteRepository: ComprobanteRepository,
    private readonly sriDispatcher: SRIEmissionDispatcherService,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    claveAcceso: string,
    currentUser: EmitirManualCurrentUser,
  ): Promise<EmissionOutcome> {
    const comprobante =
      await this.comprobanteRepository.findByClaveAcceso(claveAcceso);

    if (!comprobante) {
      throw new NotFoundException(
        `Comprobante con claveAcceso ${claveAcceso} no encontrado`,
      );
    }

    const allowedFrom: ReadonlyArray<string> = [
      ComprobanteEstado.BORRADOR,
      ComprobanteEstado.POR_EMITIR,
    ];
    if (!allowedFrom.includes(comprobante.estado)) {
      throw new ConflictException(
        `Comprobante en estado ${comprobante.estado} no es elegible para emisión manual; debe estar en BORRADOR o POR_EMITIR`,
      );
    }

    const outcome = await this.sriDispatcher.tryEmitManual(comprobante.id!);

    await this.auditService.log({
      accion: 'emision-manual',
      usuarioId: currentUser.id,
      usuarioEmail: currentUser.email,
      ipAddress: currentUser.ip,
      userAgent: currentUser.userAgent,
      recurso: 'comprobante',
      recursoId: claveAcceso,
      exitoso: outcome === 'EMITTED',
      metadata: {
        comprobanteId: comprobante.id,
        previousState: comprobante.estado,
        outcome,
      },
    });

    return outcome;
  }
}
