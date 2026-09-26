import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { SRIEmissionDispatcherService } from '../../../../../sri/emision/application/services/sri-emission-dispatcher.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { Decimal } from 'decimal.js';

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

    const detalles =
      await this.paymentRepository.findPaymentDetailsByPagoId(pagoId);

    const comprobanteIdsUnicos = [
      ...new Set(
        detalles
          .map((d) => d.comprobanteId)
          .filter((id): id is bigint => id !== null && id !== undefined),
      ),
    ];

    for (const comprobanteId of comprobanteIdsUnicos) {
      const comprobante =
        await this.paymentRepository.findComprobanteById(comprobanteId);

      if (!comprobante) {
        this.logger.warn(`Comprobante ${comprobanteId} no encontrado`);
        continue;
      }

      const todosLosDetalles =
        await this.paymentRepository.findPaymentDetailsByComprobanteId(
          comprobanteId,
        );

      const totalAbonado = todosLosDetalles.reduce(
        (acc, d) => acc.plus(String(d.montoAbonado)),
        new Decimal(0),
      );

      const totalComprobante = Number(comprobante.importeTotal);

      if (totalAbonado.lessThan(totalComprobante)) {
        this.logger.log(
          `Comprobante ${comprobanteId}: pago parcial ($${totalAbonado.toString()}/$${totalComprobante}), saltando emisión`,
        );
        continue;
      }

      await this.paymentRepository.settlePaidComprobante(
        comprobanteId,
        totalAbonado.toNumber(),
      );

      const outcome = await this.sriDispatcher.tryEmit(comprobanteId);
      this.logger.log(
        `Comprobante ${comprobanteId}: dispatch outcome=${outcome}`,
      );
    }
  }
}
