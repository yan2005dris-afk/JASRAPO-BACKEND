import { Injectable } from '@nestjs/common';
import { PrefacturaService } from '../domain/services/prefactura.service';
import { SRIEmissionDispatcherService } from '../../../../sri/emision/application/services/sri-emission-dispatcher.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

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

    const prefacturaId = detalles[0].prefacturaId;

    const prefactura =
      await this.prefacturaService.findPrefacturaWithDetails(prefacturaId);

    if (!prefactura) {
      this.logger.warn(
        `Prefactura ${prefacturaId} no encontrada para cuotaConvenioId=${cuotaConvenioId}`,
      );
      return;
    }

    const comprobanteId = prefactura.comprobanteId;
    if (!comprobanteId) {
      this.logger.log(
        `Prefactura ${prefacturaId} no tiene comprobanteId, saltando emisión`,
      );
      return;
    }

    const todasLasCuotaIds = prefactura.cuotaConvenioIds;

    if (todasLasCuotaIds.length === 0) {
      this.logger.warn(`Prefactura ${prefacturaId} no tiene cuotas asociadas`);
      return;
    }

    const cuotas =
      await this.prefacturaService.findCuotasByIds(todasLasCuotaIds);

    const todasPagadas =
      cuotas.length === todasLasCuotaIds.length &&
      cuotas.every((cuota) => cuota.estado === 'PAGADA');

    if (!todasPagadas) {
      this.logger.log(
        `Prefactura ${prefacturaId}: no todas las cuotas están PAGADA, saltando emisión`,
      );
      return;
    }

    const outcome = await this.sriDispatcher.tryEmit(comprobanteId);
    this.logger.log(
      `Prefactura ${prefacturaId} (comprobanteId=${comprobanteId}): dispatch outcome=${outcome}`,
    );
  }
}
