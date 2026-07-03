import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import type { Prisma } from 'src/generated/prisma/client';
import {
  EstadoCuotaConvenio,
  EstadoPago,
  TipoDetallePago,
} from 'src/generated/prisma/enums';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { safePaymentWithDetailSelect } from '../../domain/types/IPayment';

@Injectable()
export class AnnulPaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(
    pagoId: bigint,
    dto: { motivoAnulacion: string; anuladoPor?: string },
  ) {
    if (!dto.motivoAnulacion?.trim()) {
      throw new BadRequestException('El motivo de anulación es obligatorio');
    }

    const pago = await this.paymentRepository.findUniquePago(
      { pagoId },
      {
        ...safePaymentWithDetailSelect,
        deletedAt: true,
      } as any,
    );

    if (!pago || pago.deletedAt) {
      throw new NotFoundException(`Pago con ID ${pagoId} no encontrado`);
    }

    if (pago.estadoPago === EstadoPago.ANULADO) {
      throw new BadRequestException('El pago ya se encuentra ANULADO');
    }

    if (![EstadoPago.PENDIENTE, EstadoPago.REGISTRADO].includes(pago.estadoPago)) {
      throw new BadRequestException(
        `No se puede anular un pago en estado ${pago.estadoPago}`,
      );
    }

    await this.paymentRepository.executeTransaction(async (tx) => {
      for (const detalle of pago.detallePago ?? []) {
        if (detalle.tipoPago === TipoDetallePago.CUOTA_CONVENIO && detalle.cuotaConvenioId) {
          await this.revertInstallment(tx, detalle.cuotaConvenioId, detalle.montoAbonado);
        }
      }

      await this.paymentRepository.updateManySaldoFavor(
        { pagoId, deletedAt: null },
        {
          disponibleParaAplicar: false,
          deletedAt: new Date(),
        },
        tx,
      );

      await this.paymentRepository.updateManyDetallePago(
        { pagoId, deletedAt: null },
        { deletedAt: new Date() },
        tx,
      );

      await this.paymentRepository.updatePago(
        { pagoId },
        {
          estadoPago: EstadoPago.ANULADO,
          motivoAnulacion: dto.motivoAnulacion,
          fechaAnulacion: new Date(),
          anuladoPor: dto.anuladoPor ?? 'SYSTEM',
          deletedAt: new Date(),
        },
        undefined,
        tx,
      );
    });

    return this.paymentRepository.findUniquePago(
      { pagoId },
      { ...safePaymentWithDetailSelect, deletedAt: true } as any,
    );
  }

  private async revertInstallment(
    tx: Prisma.TransactionClient,
    cuotaConvenioId: bigint,
    montoAbonado: any,
  ) {
    const cuota = await this.paymentRepository.findUniqueCuotaConvenio(
      { cuotaConvenioId },
      {
        cuotaConvenioId: true,
        montoPagado: true,
        saldoPendiente: true,
      },
      tx,
    );

    if (!cuota) return;

    const montoPagado = Decimal.max(new Decimal(cuota.montoPagado).minus(montoAbonado), 0);
    const saldoPendiente = new Decimal(cuota.saldoPendiente).plus(montoAbonado);

    await this.paymentRepository.updateCuotaConvenio(
      { cuotaConvenioId },
      {
        montoPagado: montoPagado.toNumber(),
        saldoPendiente: saldoPendiente.toNumber(),
        estado: EstadoCuotaConvenio.PENDIENTE,
        pagoCompleto: false,
        fechaPago: montoPagado.equals(0) ? null : undefined,
      },
      tx,
    );
  }
}
