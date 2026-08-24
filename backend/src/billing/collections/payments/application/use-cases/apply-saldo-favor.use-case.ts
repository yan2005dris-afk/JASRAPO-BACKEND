import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { EstadoPago, TipoDetallePago } from 'src/generated/prisma/enums';
import { ApplySaldoFavorDto } from '../../interfaces/dto/create-payment.dto';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';
import type { PaymentEntity } from '../../domain/entities/payment.entity';

@Injectable()
export class ApplySaldoFavorUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly eventosPendientesRepository: EventosPendientesRepository,
  ) {}

  async execute(
    dto: ApplySaldoFavorDto,
    creadoPor = 'SYSTEM',
  ): Promise<PaymentEntity> {
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
        const saldo = await this.paymentRepository.findSaldoFavorById(
          BigInt(dto.saldoFavorId),
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
          const comprobante = await this.paymentRepository.findComprobanteById(
            BigInt(dto.comprobanteId),
            tx,
          );
          if (!comprobante) {
            throw new NotFoundException(
              `Comprobante ${dto.comprobanteId} no encontrado`,
            );
          }
          if (
            comprobante.importeTotal !== null &&
            montoAplicar.greaterThan(new Decimal(comprobante.importeTotal))
          ) {
            throw new BadRequestException(
              `El monto a aplicar excede el valor del comprobante ${dto.comprobanteId}`,
            );
          }
        }

        const pago = await this.paymentRepository.createPagoRecord(
          {
            clienteId: BigInt(dto.clienteId),
            cajaId: null,
            banco: null,
            tarjetaCredito: null,
            fechaPago: new Date(),
            montoTotalRecibido: montoAplicar.toNumber(),
            numeroOperacion: null,
            observaciones: dto.observaciones ?? 'Aplicación de saldo a favor',
            referenciaBanco: null,
            comprobanteUrl: null,
            estadoPago: EstadoPago.REGISTRADO,
            creadoPor,
          },
          tx,
        );

        if (dto.cuotaConvenioId) {
          const cuota = await this.paymentRepository.findCuotaConvenioById(
            BigInt(dto.cuotaConvenioId),
            tx,
          );

          if (!cuota || cuota.deletedAt) {
            throw new NotFoundException(
              `Cuota ${dto.cuotaConvenioId} no encontrada`,
            );
          }

          if (cuota.estado === 'PAGADA') {
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

          await this.paymentRepository.updateCuotaConvenioPayment(
            BigInt(dto.cuotaConvenioId),
            cuota.saldoPendiente,
            {
              montoPagado: montoPagado.toNumber(),
              saldoPendiente: saldoPendiente.toNumber(),
              estado: pagada ? 'PAGADA' : 'PENDIENTE',
              pagoCompleto: pagada,
              fechaPago: pagada ? new Date() : null,
            },
            tx,
          );

          if (pagada) {
            await this.eventosPendientesRepository.createPending(
              'cuota.pagada',
              {
                cuotaConvenioId: dto.cuotaConvenioId.toString(),
                pagoId: pago.pagoId.toString(),
              },
              'CUOTA_CONVENIO',
              dto.cuotaConvenioId.toString(),
              tx,
            );
          }
        }

        await this.paymentRepository.createDetallesPago(
          [
            {
              pagoId: pago.pagoId,
              comprobanteId: dto.comprobanteId
                ? BigInt(dto.comprobanteId)
                : null,
              cuotaConvenioId: dto.cuotaConvenioId
                ? BigInt(dto.cuotaConvenioId)
                : null,
              tipoPago: TipoDetallePago.SALDO_FAVOR,
              montoAbonado: montoAplicar.toNumber(),
              formaPagoId: dto.formaPagoId,
              referencia: `SALDO_FAVOR:${dto.saldoFavorId}`,
              fechaTransaccion: new Date(),
            },
          ],
          tx,
        );

        const saldoRestante = montoDisponible.minus(montoAplicar);
        await this.paymentRepository.updateSaldoFavorRecord(
          BigInt(dto.saldoFavorId),
          saldoRestante.equals(0)
            ? { disponibleParaAplicar: false }
            : { montoSaldo: saldoRestante.toNumber() },
          tx,
        );

        if (dto.comprobanteId) {
          await this.eventosPendientesRepository.createPending(
            'pago.validado',
            {
              pagoId: pago.pagoId.toString(),
              estadoPago: EstadoPago.REGISTRADO,
              origen: 'SALDO_FAVOR',
              creadoPor,
            },
            'PAGO',
            pago.pagoId.toString(),
            tx,
          );
        }

        return pago.pagoId;
      },
    );

    return (await this.paymentRepository.findById(pagoId))!;
  }
}
