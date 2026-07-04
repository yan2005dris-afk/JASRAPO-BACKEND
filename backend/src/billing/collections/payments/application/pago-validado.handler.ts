import { Injectable, Logger } from '@nestjs/common';
import { PaymentRepository } from 'src/billing/collections/payments/domain/repositories/payment.repository';
import {
  SRIEmissionDispatcherService,
  EmissionOutcome,
} from './sri-emission-dispatcher.service';

/** Minimal interface for the job service, shared with SRIEmissionDispatcherService */
export interface JobService {
  send(name: string, data: object): Promise<string>;
}

/**
 * W-3: The handler is now invoked directly by the outbox processor (no longer
 * an `@OnEvent('pago.validado')` listener). Removing the in-process event
 * guarantees the comprobante emission is durable: the outbox row is written
 * in the same transaction as `updateManyPagos`, so we never lose the
 * "emit comprobante when pago totals hit the bill" rule on a crash.
 *
 * RF-002: The comprobante-emission sequence (BORRADOR check + optimistic
 * lock + SRI job enqueue) is delegated to SRIEmissionDispatcherService so
 * future triggers (e.g. `cuota.pagada` in PR 2b) share the same pipeline.
 */
@Injectable()
export class PagoValidadoHandler {
  private readonly logger = new Logger(PagoValidadoHandler.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly sriDispatcher: SRIEmissionDispatcherService,
  ) {}

  async procesarPagoValidado(pagoId: bigint): Promise<void> {
    this.logger.log(`Procesando pago.validado: pagoId=${pagoId}`);

    // RF-003: First, find the detalle_pago for THIS pago only to discover
    // which comprobanteIds are touched by it.
    const pagoDetalles = await this.paymentRepository.findManyDetallePago({
      where: { pagoId },
    });

    if (pagoDetalles.length === 0) {
      this.logger.warn(`Pago ${pagoId} no tiene detalle_pago registrados`);
      return;
    }

    // Collect unique comprobanteIds touched by this pago
    const comprobanteIds = new Set<bigint>();
    for (const detalle of pagoDetalles) {
      if (detalle.comprobanteId) {
        comprobanteIds.add(detalle.comprobanteId as bigint);
      }
    }

    if (comprobanteIds.size === 0) {
      this.logger.warn(
        `Pago ${pagoId} no tiene detalle_pago con comprobanteId`,
      );
      return;
    }

    // RF-003: For each unique comprobanteId, sum ALL active detalle_pago.montoAbonado
    // for that comprobanteId (across every pago). This handles multi-pago scenarios
    // like pago1=$60 then pago2=$40 to complete $100.
    for (const comprobanteId of comprobanteIds) {
      const allDetalles = await this.paymentRepository.findManyDetallePago({
        where: { comprobanteId },
      });

      const totalAbonado = allDetalles.reduce(
        (sum, d) => sum + (Number(d.montoAbonado) || 0),
        0,
      );

      await this.processComprobante(comprobanteId, totalAbonado);
    }
  }

  private async processComprobante(
    comprobanteId: bigint,
    totalAbonado: number,
  ): Promise<void> {
    const comprobante = await this.paymentRepository.findUniqueComprobante({
      id: comprobanteId,
    });

    if (!comprobante) {
      this.logger.warn(`Comprobante ${comprobanteId} no encontrado`);
      return;
    }

    const importeTotal = Number(comprobante.importeTotal) || 0;

    // RB-001: Verificar si el pago está completo. This check stays in the
    // handler because the context (totalAbonado) is handler-local — the
    // dispatcher is comprobante-centric and does not see totalAbonado.
    if (totalAbonado < importeTotal) {
      this.logger.log(
        `Comprobante ${comprobanteId}: totalAbonado=${totalAbonado} < importeTotal=${importeTotal}, pendiente`,
      );
      return;
    }

    // Delegate BORRADOR check + optimistic lock + SRI enqueue to the
    // dispatcher. The outcome is logged for observability but no further
    // action is required — every non-EMITTED outcome is a legitimate
    // no-op (race lost, already emitted, etc.).
    const outcome: EmissionOutcome =
      await this.sriDispatcher.tryEmit(comprobanteId);

    this.logger.log(
      `Comprobante ${comprobanteId}: dispatch outcome=${outcome}`,
    );
  }
}
