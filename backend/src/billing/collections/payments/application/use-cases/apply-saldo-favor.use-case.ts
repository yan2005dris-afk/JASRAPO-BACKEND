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

    if (dto.comprobanteId && dto.cuotaConvenioId) {
      throw new BadRequestException(
        'No puede aplicar el saldo a un comprobante y una cuota simultáneamente',
      );
    }

    const montoAplicar = new Decimal(dto.montoAplicar);
    if (montoAplicar.isNegative() || montoAplicar.isZero()) {
      throw new BadRequestException('El monto a aplicar debe ser mayor a cero');
    }

    const pagoId = await this.paymentRepository.executeTransaction(
      async (tx) => {
        const saldo = await this.paymentRepository.findUniqueSaldoFavor(
          { saldoFavorId: BigInt(dto.saldoFavorId) },
          {
            saldoFavorId: true,
            clienteId: true,
            montoSaldo: true,
            disponibleParaAplicar: true,
            deletedAt: true,
          },
          tx,
        );

        if (!saldo || saldo.deletedAt) {
          throw new NotFoundException(
            `Saldo a favor ${dto.saldoFavorId} no encontrado`,
          );
        }

        if (!saldo.disponibleParaAplicar) {
          throw new BadRequestException('El saldo a favor no está disponible');
        }

        if (saldo.clienteId !== BigInt(dto.clienteId)) {
          throw new BadRequestException(
            'El saldo a favor no pertenece al cliente indicado',
          );
        }

        const montoDisponible = new Decimal(saldo.montoSaldo);

        if (montoAplicar.greaterThan(montoDisponible)) {
          throw new BadRequestException(
            'El monto a aplicar excede el saldo disponible',
          );
        }

        if (dto.comprobanteId) {
          const comprobante =
            await this.paymentRepository.findUniqueComprobante(
              { id: BigInt(dto.comprobanteId) },
              { id: true, importeTotal: true },
              tx,
            );
          if (!comprobante) {
            throw new NotFoundException(
              `Comprobante ${dto.comprobanteId} no encontrado`,
            );
          }
          if (
            comprobante.importeTotal &&
            montoAplicar.greaterThan(new Decimal(comprobante.importeTotal))
          ) {
            throw new BadRequestException(
              `El monto a aplicar excede el valor del comprobante ${dto.comprobanteId}`,
            );
          }
        }

        if (dto.cuotaConvenioId) {
          const cuota = await this.paymentRepository.findUniqueCuotaConvenio(
            { cuotaConvenioId: BigInt(dto.cuotaConvenioId) },
            {
              cuotaConvenioId: true,
              estado: true,
              saldoPendiente: true,
              montoPagado: true,
              deletedAt: true,
            },
            tx,
          );

          if (!cuota || cuota.deletedAt) {
            throw new NotFoundException(
              `Cuota ${dto.cuotaConvenioId} no encontrada`,
            );
          }

          if (cuota.estado === EstadoCuotaConvenio.PAGADA) {
            throw new BadRequestException(
              `La cuota ${dto.cuotaConvenioId} ya está pagada`,
            );
          }

          if (montoAplicar.greaterThan(new Decimal(cuota.saldoPendiente))) {
            throw new BadRequestException(
              `El monto excede el saldo pendiente de la cuota ${dto.cuotaConvenioId}`,
            );
          }

          const saldoPendiente = new Decimal(cuota.saldoPendiente).minus(
            montoAplicar,
          );
          const montoPagado = new Decimal(cuota.montoPagado).plus(montoAplicar);
          const pagada = saldoPendiente.equals(0);

          await this.paymentRepository.updateCuotaConvenio(
            { cuotaConvenioId: BigInt(dto.cuotaConvenioId) },
            {
              montoPagado: montoPagado.toNumber(),
              saldoPendiente: saldoPendiente.toNumber(),
              estado: pagada
                ? EstadoCuotaConvenio.PAGADA
                : EstadoCuotaConvenio.PENDIENTE,
              pagoCompleto: pagada,
              fechaPago: pagada ? new Date() : null,
            },
            tx,
          );
        }

        const pago = await this.paymentRepository.createPago(
          {
            clienteId: BigInt(dto.clienteId),
            fechaPago: new Date(),
            montoTotalRecibido: montoAplicar.toNumber(),
            observaciones: dto.observaciones ?? 'Aplicación de saldo a favor',
            estadoPago: EstadoPago.REGISTRADO,
            creadoPor,
          },
          { pagoId: true },
          tx,
        );

        await this.paymentRepository.createDetallePago(
          {
            pagoId: pago.pagoId,
            comprobanteId: dto.comprobanteId ? BigInt(dto.comprobanteId) : null,
            cuotaConvenioId: dto.cuotaConvenioId
              ? BigInt(dto.cuotaConvenioId)
              : null,
            tipoPago: TipoDetallePago.SALDO_FAVOR,
            montoAbonado: montoAplicar.toNumber(),
            formaPagoId: dto.formaPagoId,
            referencia: `SALDO_FAVOR:${dto.saldoFavorId}`,
            fechaTransaccion: new Date(),
          },
          tx,
        );

        const saldoRestante = montoDisponible.minus(montoAplicar);
        await this.paymentRepository.updateSaldoFavor(
          { saldoFavorId: BigInt(dto.saldoFavorId) },
          saldoRestante.equals(0)
            ? { disponibleParaAplicar: false }
            : { montoSaldo: saldoRestante.toNumber() },
          tx,
        );

        return pago.pagoId;
      },
    );

    return this.paymentRepository.findUniquePago(
      { pagoId },
      safePaymentWithDetailSelect,
    );
  }
}
