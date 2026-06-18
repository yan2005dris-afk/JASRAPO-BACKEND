import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import {
  EstadoCuotaConvenio,
  EstadoPago,
  TipoDetallePago,
} from 'src/generated/prisma/enums';
import { ApplySaldoFavorDto } from '../../interfaces/dto/create-payment.dto';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { safePaymentWithDetailSelect } from '../../domain/types/IPayment';

@Injectable()
export class ApplySaldoFavorUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(dto: ApplySaldoFavorDto, creadoPor = 'SYSTEM') {
    if (!dto.comprobanteId && !dto.cuotaConvenioId) {
      throw new BadRequestException(
        'Debe indicar comprobanteId o cuotaConvenioId para aplicar el saldo',
      );
    }

    const pagoId = await this.paymentRepository.executeTransaction(async (tx) => {
      const saldo = await tx.saldoFavorCliente.findUnique({
        where: { saldoFavorId: BigInt(dto.saldoFavorId) },
        select: {
          saldoFavorId: true,
          clienteId: true,
          montoSaldo: true,
          disponibleParaAplicar: true,
          deletedAt: true,
        },
      });

      if (!saldo || saldo.deletedAt) {
        throw new NotFoundException(`Saldo a favor ${dto.saldoFavorId} no encontrado`);
      }

      if (!saldo.disponibleParaAplicar) {
        throw new BadRequestException('El saldo a favor no está disponible');
      }

      if (saldo.clienteId !== BigInt(dto.clienteId)) {
        throw new BadRequestException('El saldo a favor no pertenece al cliente indicado');
      }

      const montoDisponible = new Decimal(saldo.montoSaldo);
      const montoAplicar = new Decimal(dto.montoAplicar);

      if (montoAplicar.greaterThan(montoDisponible)) {
        throw new BadRequestException('El monto a aplicar excede el saldo disponible');
      }

      if (dto.comprobanteId) {
        const comprobante = await tx.comprobantes.findUnique({
          where: { id: BigInt(dto.comprobanteId) },
          select: { id: true },
        });
        if (!comprobante) {
          throw new NotFoundException(`Comprobante ${dto.comprobanteId} no encontrado`);
        }
      }

      if (dto.cuotaConvenioId) {
        const cuota = await tx.cuotaConvenio.findUnique({
          where: { cuotaConvenioId: BigInt(dto.cuotaConvenioId) },
          select: {
            cuotaConvenioId: true,
            estado: true,
            saldoPendiente: true,
            montoPagado: true,
            deletedAt: true,
          },
        });

        if (!cuota || cuota.deletedAt) {
          throw new NotFoundException(`Cuota ${dto.cuotaConvenioId} no encontrada`);
        }

        if (cuota.estado === EstadoCuotaConvenio.PAGADA) {
          throw new BadRequestException(`La cuota ${dto.cuotaConvenioId} ya está pagada`);
        }

        const saldoPendiente = Decimal.max(
          new Decimal(cuota.saldoPendiente).minus(montoAplicar),
          0,
        );
        const montoPagado = new Decimal(cuota.montoPagado).plus(montoAplicar);
        const pagada = saldoPendiente.equals(0);

        await tx.cuotaConvenio.update({
          where: { cuotaConvenioId: BigInt(dto.cuotaConvenioId) },
          data: {
            montoPagado: montoPagado.toNumber(),
            saldoPendiente: saldoPendiente.toNumber(),
            estado: pagada
              ? EstadoCuotaConvenio.PAGADA
              : EstadoCuotaConvenio.PENDIENTE,
            pagoCompleto: pagada,
            fechaPago: pagada ? new Date() : null,
          },
        });
      }

      const pago = await tx.pagos.create({
        data: {
          clienteId: BigInt(dto.clienteId),
          fechaPago: new Date(),
          montoTotalRecibido: montoAplicar.toNumber(),
          observaciones: dto.observaciones ?? 'Aplicación de saldo a favor',
          estadoPago: EstadoPago.REGISTRADO,
          creadoPor,
        },
        select: { pagoId: true },
      });

      await tx.detallePago.create({
        data: {
          pagoId: pago.pagoId,
          comprobanteId: dto.comprobanteId ? BigInt(dto.comprobanteId) : null,
          cuotaConvenioId: dto.cuotaConvenioId ? BigInt(dto.cuotaConvenioId) : null,
          tipoPago: TipoDetallePago.SALDO_FAVOR,
          montoAbonado: montoAplicar.toNumber(),
          formaPagoId: dto.formaPagoId,
          referencia: `SALDO_FAVOR:${dto.saldoFavorId}`,
          fechaTransaccion: new Date(),
        },
      });

      const saldoRestante = montoDisponible.minus(montoAplicar);
      await tx.saldoFavorCliente.update({
        where: { saldoFavorId: BigInt(dto.saldoFavorId) },
        data: saldoRestante.equals(0)
          ? { disponibleParaAplicar: false }
          : { montoSaldo: saldoRestante.toNumber() },
      });

      return pago.pagoId;
    });

    return this.paymentRepository.findUniquePago(
      { pagoId },
      safePaymentWithDetailSelect,
    );
  }
}
