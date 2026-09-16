import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { SRIEmissionDispatcherService } from '../../../../../sri/emision/application/services/sri-emission-dispatcher.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { EstadoServicioContrato } from 'src/shared/enums';

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
        (acc, d) => acc + Number(d.montoAbonado),
        0,
      );

      const totalComprobante = Number(comprobante.importeTotal);

      if (totalAbonado < totalComprobante) {
        this.logger.log(
          `Comprobante ${comprobanteId}: pago parcial ($${totalAbonado}/$${totalComprobante}), saltando emisión`,
        );
        continue;
      }

      // Marcar prefactura vinculada como PAGADA y actualizar contratos de instalación (mes = 0)
      await this.paymentRepository.executeTransaction?.(async (tx: any) => {
        const prismaClient = tx ?? (this.paymentRepository as any).prisma;

        const prefacturas = await prismaClient.prefacturas.findMany({
          where: { comprobanteId, deletedAt: null },
          select: {
            prefacturaId: true,
            contratoId: true,
            prefacturaDetalle: {
              where: {
                deletedAt: null,
                rubro: {
                  codigoSistemaRubro: 'INSTALACION',
                  deletedAt: null,
                },
              },
              select: { prefacturaDetalleId: true },
            },
          },
        });

        await prismaClient.prefacturas.updateMany({
          where: { comprobanteId, deletedAt: null },
          data: {
            estado: 'PAGADA',
            saldoActual: 0,
            saldoVencido: 0,
            abono: totalAbonado,
          },
        });

        const contratosInstalacionIds = prefacturas
          .filter(
            (p: any) =>
              Array.isArray(p.prefacturaDetalle) &&
              p.prefacturaDetalle.length > 0,
          )
          .map((p: any) => p.contratoId);

        if (contratosInstalacionIds.length > 0) {
          await prismaClient.contratos.updateMany({
            where: {
              contratoId: { in: contratosInstalacionIds },
              estadoServicio: EstadoServicioContrato.PENDIENTE_PAGO,
              deletedAt: null,
            },
            data: {
              estado: 'PENDIENTE_INSTALACION',
              estadoServicio: EstadoServicioContrato.PENDIENTE_INSTALACION,
            },
          });
        }
      });

      const outcome = await this.sriDispatcher.tryEmit(comprobanteId);
      this.logger.log(
        `Comprobante ${comprobanteId}: dispatch outcome=${outcome}`,
      );
    }
  }
}
