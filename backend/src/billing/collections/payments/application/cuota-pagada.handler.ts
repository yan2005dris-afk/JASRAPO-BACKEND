import { Injectable } from '@nestjs/common';
import { PrefacturaService } from '../domain/services/prefactura.service';
import { SRIEmissionDispatcherService } from '../../../../sri/emision/application/services/sri-emission-dispatcher.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

/**
 * Handles the `cuota.pagada` outbox event.
 *
 * When a cuota is marked as PAGADA, this handler checks whether ALL cuotas
 * belonging to the same prefactura are also PAGADA. If yes, it delegates to
 * SRIEmissionDispatcherService.tryEmit() so the comprobante is emitted.
 *
 * The handler is registered in PaymentsModule.onModuleInit and invoked
 * by the OutboxProcessor when a `cuota.pagada` row is polled.
 */
@LogContext()
@Injectable()
export class CuotaPagadaHandler {
  constructor(
    private readonly prefacturaService: PrefacturaService,
    private readonly sriDispatcher: SRIEmissionDispatcherService,
    private readonly logger: LoggerService,
  ) {}

  async procesarCuotaPagada(cuotaConvenioId: bigint): Promise<void> {
    this.logger.log(
      `Procesando cuota.pagada: cuotaConvenioId=${cuotaConvenioId}`,
    );

    // 1. Find PrefacturaDetalle by cuotaConvenioId
    const detalles =
      await this.prefacturaService.findPrefacturaDetalleByCuotaConvenioId(
        cuotaConvenioId,
      );

    if (detalles.length === 0) {
      this.logger.warn(
        `No se encontró PrefacturaDetalle para cuotaConvenioId=${cuotaConvenioId}`,
      );
      return;
    }

    const prefacturaId = detalles[0].prefacturaId as bigint;

    // 2. Get prefactura with comprobanteId + all detalle cuotaConvenioIds
    const prefactura = await this.prefacturaService.findPrefacturaById(
      prefacturaId,
      {
        prefacturaId: true,
        comprobanteId: true,
        prefacturaDetalle: {
          select: { cuotaConvenioId: true },
        },
      },
    );

    if (!prefactura) {
      this.logger.warn(
        `Prefactura ${prefacturaId} no encontrada para cuotaConvenioId=${cuotaConvenioId}`,
      );
      return;
    }

    const comprobanteId = prefactura.comprobanteId as bigint | null;
    if (!comprobanteId) {
      this.logger.log(
        `Prefactura ${prefacturaId} no tiene comprobanteId, saltando emisión`,
      );
      return;
    }

    // 3. Collect all cuotaConvenioIds from this prefactura's detalle
    const todasLasCuotaIds = (
      prefactura.prefacturaDetalle as Array<{ cuotaConvenioId: bigint | null }>
    )
      .map((d) => d.cuotaConvenioId)
      .filter((id): id is bigint => id !== null);

    if (todasLasCuotaIds.length === 0) {
      this.logger.warn(`Prefactura ${prefacturaId} no tiene cuotas asociadas`);
      return;
    }

    // 4. Query ALL cuotas for those cuotaConvenioIds
    // R-D.1: exclude soft-deleted cuotas so they don't block emission
    const cuotas = await this.prefacturaService.findManyCuotaConvenio(
      { cuotaConvenioId: { in: todasLasCuotaIds }, deletedAt: null },
      { cuotaConvenioId: true, estado: true },
    );

    // 5. Check if ALL are PAGADA
    const todasPagadas = cuotas.every(
      (cuota: { estado: string }) => cuota.estado === 'PAGADA',
    );

    if (!todasPagadas) {
      this.logger.log(
        `Prefactura ${prefacturaId}: no todas las cuotas están PAGADA, saltando emisión`,
      );
      return;
    }

    // 6. All cuotas are PAGADA → delegate to SRIEmissionDispatcherService
    const outcome = await this.sriDispatcher.tryEmit(comprobanteId);
    this.logger.log(
      `Prefactura ${prefacturaId} (comprobanteId=${comprobanteId}): dispatch outcome=${outcome}`,
    );
  }
}
