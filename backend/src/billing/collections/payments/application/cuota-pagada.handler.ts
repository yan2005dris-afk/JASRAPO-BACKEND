import { Injectable, Logger } from '@nestjs/common';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import { SRIEmissionDispatcherService } from './sri-emission-dispatcher.service';

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
@Injectable()
export class CuotaPagadaHandler {
  private readonly logger = new Logger(CuotaPagadaHandler.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly sriDispatcher: SRIEmissionDispatcherService,
  ) {}

  async procesarCuotaPagada(cuotaConvenioId: bigint): Promise<void> {
    this.logger.log(
      `Procesando cuota.pagada: cuotaConvenioId=${cuotaConvenioId}`,
    );

    // 1. Find PrefacturaDetalle by cuotaConvenioId
    const detalles =
      await this.paymentRepository.findPrefacturaDetalleByCuotaConvenioId(
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
    const prefactura = await this.paymentRepository.findPrefacturaById(
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
    const cuotas = await this.paymentRepository.findManyCuotaConvenio(
      { cuotaConvenioId: { in: todasLasCuotaIds } },
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
