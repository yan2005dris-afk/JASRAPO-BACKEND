import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentRepository } from 'src/billing/collections/payments/domain/repositories/payment.repository';
import { ComprobanteRepository } from 'src/sri/emision/domain/repositories/comprobante.repository';
import { ComprobanteEstado } from 'src/sri/emision/domain/constants/comprobante-estado.enum';
import { SRI_EMISION_JOB } from 'src/sri/emision/infrastructure/queue/processors/sri-emision.constants';

/** Minimal interface for the job service to avoid pg-boss ESM import issues */
export interface JobService {
  send(name: string, data: object): Promise<string>;
}

interface PagoValidadoEvent {
  pagoId: bigint;
}

@Injectable()
export class PagoValidadoHandler {
  private readonly logger = new Logger(PagoValidadoHandler.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly comprobanteRepository: ComprobanteRepository,
    @Inject('JobService') private readonly jobsService: JobService,
  ) {}

  @OnEvent('pago.validado')
  async handlePagoValidado(event: PagoValidadoEvent): Promise<void> {
    const { pagoId } = event;
    this.logger.log(`Procesando pago.validado: pagoId=${pagoId}`);

    try {
      // RF-003: First, find the detalle_pago for THIS pago only to discover
      // which comprobanteIds are touched by it.
      const pagoDetalles = await this.paymentRepository.findManyDetallePago({
        where: { pagoId },
      });

      if (pagoDetalles.length === 0) {
        this.logger.warn(
          `Pago ${pagoId} no tiene detalle_pago registrados`,
        );
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
    } catch (error) {
      this.logger.error(
        `Error procesando pago.validado pagoId=${pagoId}: ${(error as Error).message}`,
      );
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
      this.logger.warn(
        `Comprobante ${comprobanteId} no encontrado`,
      );
      return;
    }

    // RB-002: No emitir si comprobante ya fue emitido
    if (comprobante.estado !== ComprobanteEstado.BORRADOR) {
      this.logger.log(
        `Comprobante ${comprobanteId} no está en BORRADOR (estado=${comprobante.estado}), saltando emisión`,
      );
      return;
    }

    const importeTotal = Number(comprobante.importeTotal) || 0;

    // RB-001: Verificar si el pago está completo
    if (totalAbonado < importeTotal) {
      this.logger.log(
        `Comprobante ${comprobanteId}: totalAbonado=${totalAbonado} < importeTotal=${importeTotal}, pendiente`,
      );
      return;
    }

    // Optimistic lock: solo actualizar si sigue en BORRADOR
    const locked = await this.comprobanteRepository.updateEstadoWithLock(
      comprobanteId,
      ComprobanteEstado.BORRADOR,
      ComprobanteEstado.ENVIANDO,
    );

    if (!locked) {
      this.logger.warn(
        `Comprobante ${comprobanteId}: optimistic lock falló, otro proceso ganó la carrera`,
      );
      return;
    }

    // Encolar job de emisión SRI
    await this.jobsService.send(SRI_EMISION_JOB, {
      tipo: 'FACTURA_DESDE_PREFACTURA',
      comprobanteId,
    });

    this.logger.log(
      `Comprobante ${comprobanteId}: pagado completamente, job sri-emision encolado`,
    );
  }
}
