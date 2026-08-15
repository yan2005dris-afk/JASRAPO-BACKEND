import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import {
  EstadoPago,
  TipoDetallePago,
} from '../../domain/enums';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import type { PaymentEntity } from '../../domain/entities/payment.entity';

@Injectable()
export class AnnulPaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(
    pagoId: bigint,
    dto: { motivoAnulacion: string; anuladoPor?: string },
  ): Promise<PaymentEntity> {
    if (!dto.motivoAnulacion?.trim()) {
      throw new BadRequestException('El motivo de anulación es obligatorio');
    }

    await this.paymentRepository.executeTransaction(async (tx) => {
      // Re-read inside the transaction to validate state atomically
      const pago = await this.paymentRepository.findById(pagoId, tx);

      if (!pago || pago.deletedAt) {
        throw new NotFoundException(`Pago con ID ${pagoId} no encontrado`);
      }

      if (pago.estadoPago === EstadoPago.ANULADO) {
        throw new BadRequestException('El pago ya se encuentra ANULADO');
      }

      const validForAnnul: string[] = [
        EstadoPago.PENDIENTE,
        EstadoPago.REGISTRADO,
      ];
      if (!validForAnnul.includes(pago.estadoPago)) {
        throw new BadRequestException(
          `No se puede anular un pago en estado ${pago.estadoPago}`,
        );
      }

      for (const detalle of pago.detallePago ?? []) {
        if (
          detalle.tipoPago === TipoDetallePago.CUOTA_CONVENIO &&
          detalle.cuotaConvenioId
        ) {
          await this.revertInstallment(
            tx,
            detalle.cuotaConvenioId,
            detalle.montoAbonado,
          );
        }
      }

      await this.paymentRepository.updateManySaldoFavorByPagoId(
        pagoId,
        {
          disponibleParaAplicar: false,
          deletedAt: new Date(),
        },
        tx,
      );

      await this.paymentRepository.updateManyDetallePagoByPagoId(
        pagoId,
        { deletedAt: new Date() },
        tx,
      );

      const result = await this.paymentRepository.annulPagoTransaction(
        pagoId,
        pago.estadoPago,
        {
          motivoAnulacion: dto.motivoAnulacion,
          fechaAnulacion: new Date(),
          anuladoPor: dto.anuladoPor ?? 'SYSTEM',
          deletedAt: new Date(),
        },
        tx,
      );

      if (result.count === 0) {
        throw new BadRequestException(
          'El pago fue modificado por otra solicitud concurrente',
        );
      }
    });

    return (await this.paymentRepository.findById(pagoId))!;
  }

  private async revertInstallment(
    tx: unknown,
    cuotaConvenioId: bigint,
    montoAbonado: any,
  ) {
    const cuota = await this.paymentRepository.findCuotaConvenioById(
      cuotaConvenioId,
      tx,
    );

    if (!cuota) return;

    const montoPagado = Decimal.max(
      new Decimal(cuota.montoPagado).minus(montoAbonado),
      0,
    );
    const saldoPendiente = new Decimal(cuota.saldoPendiente).plus(montoAbonado);

    await this.paymentRepository.updateCuotaConvenioRevert(
      cuotaConvenioId,
      {
        montoPagado: montoPagado.toNumber(),
        saldoPendiente: saldoPendiente.toNumber(),
        estado: 'PENDIENTE',
        pagoCompleto: false,
        fechaPago: montoPagado.equals(0) ? null : undefined,
      },
      tx,
    );
  }
}
