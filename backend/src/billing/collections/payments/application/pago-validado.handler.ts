import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PaymentRepository } from 'src/billing/collections/payments/domain/repositories/payment.repository';
import {
  SRIEmissionDispatcherService,
  EmissionOutcome,
} from '../../../../sri/emision/application/services/sri-emission-dispatcher.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class PagoValidadoHandler {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly sriDispatcher: SRIEmissionDispatcherService,
    private readonly logger: LoggerService,
  ) {}

  async procesarPagoValidado(pagoId: bigint): Promise<void> {
    this.logger.log(`Procesando pago.validado: pagoId=${pagoId}`);

    const pagoDetalles =
      await this.paymentRepository.findPaymentDetailsByPagoId(pagoId);

    if (pagoDetalles.length === 0) {
      this.logger.warn(`Pago ${pagoId} no tiene detalle_pago registrados`);
      return;
    }

    const comprobanteIds = new Set<bigint>();
    for (const detalle of pagoDetalles) {
      if (detalle.comprobanteId) {
        comprobanteIds.add(detalle.comprobanteId);
      }
    }

    if (comprobanteIds.size === 0) {
      this.logger.warn(
        `Pago ${pagoId} no tiene detalle_pago con comprobanteId`,
      );
      return;
    }

    for (const comprobanteId of comprobanteIds) {
      const allDetalles =
        await this.paymentRepository.findPaymentDetailsByComprobanteId(
          comprobanteId,
        );

      const totalAbonado = allDetalles.reduce(
        (sum, d) => sum.plus(d.montoAbonado ?? 0),
        new Decimal(0),
      );

      await this.processComprobante(comprobanteId, totalAbonado);
    }
  }

  private async processComprobante(
    comprobanteId: bigint,
    totalAbonado: Decimal,
  ): Promise<void> {
    const comprobante =
      await this.paymentRepository.findComprobanteById(comprobanteId);

    if (!comprobante) {
      this.logger.warn(`Comprobante ${comprobanteId} no encontrado`);
      return;
    }

    const importeTotal = new Decimal(comprobante.importeTotal ?? 0);

    if (totalAbonado.lessThan(importeTotal)) {
      this.logger.log(
        `Comprobante ${comprobanteId}: totalAbonado=${totalAbonado.toString()} < importeTotal=${importeTotal.toString()}, pendiente`,
      );
      return;
    }

    const outcome: EmissionOutcome =
      await this.sriDispatcher.tryEmit(comprobanteId);

    this.logger.log(
      `Comprobante ${comprobanteId}: dispatch outcome=${outcome}`,
    );
  }
}
