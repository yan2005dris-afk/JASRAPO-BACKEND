import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import {
  EstadoPago,
  TipoDetallePago,
  TipoOrigenAbono,
} from 'src/generated/prisma/enums';
import { CreatePaymentDto } from '../../interfaces/dto/create-payment.dto';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { EventosPendientesRepository } from 'src/shared/outbox/domain/repositories/eventos-pendientes.repository';
import type { PaymentEntity } from '../../domain/entities/payment.entity';
import type { TransactionContext } from 'src/shared/domain/types/transaction';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly eventosPendientesRepository: EventosPendientesRepository,
  ) {}

  async execute(
    dto: CreatePaymentDto,
    creadoPor = 'SYSTEM',
  ): Promise<PaymentEntity> {
    await this.validateHeader(dto);
    this.validateTotals(dto);

    const pagoId = await this.paymentRepository.executeTransaction(
      async (tx) => {
        await this.validateDetails(dto, tx);

        const pago = await this.paymentRepository.createPagoRecord(
          {
            clienteId: BigInt(dto.clienteId),
            cajaId: dto.cajaId ? BigInt(dto.cajaId) : null,
            banco: dto.banco ?? null,
            tarjetaCredito: dto.tarjetaCredito ?? null,
            fechaPago: new Date(dto.fechaPago),
            montoTotalRecibido: dto.montoTotalRecibido,
            numeroOperacion: dto.numeroOperacion ?? null,
            observaciones: dto.observaciones ?? null,
            referenciaBanco: dto.referenciaBanco ?? null,
            comprobanteUrl: dto.comprobanteUrl ?? null,
            estadoPago: EstadoPago.REGISTRADO,
            creadoPor,
          },
          tx,
        );

        await this.paymentRepository.createDetallesPago(
          dto.detalle.map((detalle) => ({
            pagoId: pago.pagoId,
            comprobanteId: detalle.comprobanteId
              ? BigInt(detalle.comprobanteId)
              : null,
            cuotaConvenioId: detalle.cuotaConvenioId
              ? BigInt(detalle.cuotaConvenioId)
              : null,
            tipoPago: detalle.tipoPago,
            montoAbonado: detalle.montoAbonado,
            formaPagoId: detalle.formaPagoId,
            referencia: detalle.referencia ?? null,
            fechaTransaccion: detalle.fechaTransaccion
              ? new Date(detalle.fechaTransaccion)
              : null,
          })),
          tx,
        );

        for (const detalle of dto.detalle) {
          if (detalle.tipoPago === TipoDetallePago.CUOTA_CONVENIO) {
            await this.applyInstallmentPayment(
              tx,
              detalle.cuotaConvenioId!,
              detalle.montoAbonado,
              pago.pagoId,
            );
          }

          if (detalle.tipoPago === TipoDetallePago.SALDO_FAVOR) {
            await this.paymentRepository.createSaldoFavorRecord(
              {
                clienteId: BigInt(dto.clienteId),
                pagoId: pago.pagoId,
                montoSaldo: detalle.montoAbonado,
                tipoOrigen: TipoOrigenAbono.PAGO_EXCESO,
                disponibleParaAplicar: true,
              },
              tx,
            );
          }
        }

        // Si el pago nace como REGISTRADO (pagos en caja/efectivo), registrar evento outbox pago.validado
        await this.eventosPendientesRepository.createPending(
          'pago.validado',
          {
            pagoId: pago.pagoId.toString(),
            estadoPago: EstadoPago.REGISTRADO,
            creadoPor,
          },
          'PAGO',
          pago.pagoId.toString(),
          tx,
        );

        return pago.pagoId;
      },
    );

    return (await this.paymentRepository.findById(pagoId))!;
  }

  private async validateHeader(dto: CreatePaymentDto) {
    const exists = await this.paymentRepository.clientExists(
      BigInt(dto.clienteId),
    );

    if (!exists) {
      throw new NotFoundException(
        `Cliente con ID ${dto.clienteId} no encontrado`,
      );
    }

    if (!dto.cajaId) return;

    const cajaAbierta = await this.paymentRepository.isCajaOpen(
      BigInt(dto.cajaId),
    );

    if (!cajaAbierta) {
      throw new BadRequestException(
        `La caja ${dto.cajaId} no existe o no se encuentra ABIERTA`,
      );
    }
  }

  private validateTotals(dto: CreatePaymentDto) {
    const totalDetalle = dto.detalle.reduce(
      (acc, detalle) => acc.plus(detalle.montoAbonado),
      new Decimal(0),
    );
    const totalRecibido = new Decimal(dto.montoTotalRecibido);

    if (
      !totalDetalle.toDecimalPlaces(2).equals(totalRecibido.toDecimalPlaces(2))
    ) {
      throw new BadRequestException(
        'El monto total recibido debe coincidir con la suma del detalle',
      );
    }
  }

  private async validateDetails(dto: CreatePaymentDto, tx: TransactionContext) {
    const comprobanteAcumulado = new Map<string, Decimal>();

    for (const detalle of dto.detalle) {
      if (detalle.tipoPago === TipoDetallePago.COMPROBANTE) {
        if (!detalle.comprobanteId) {
          throw new BadRequestException(
            'El detalle COMPROBANTE requiere comprobanteId',
          );
        }

        // Lock row to prevent concurrent race
        await this.paymentRepository.lockComprobante(
          BigInt(detalle.comprobanteId),
          tx,
        );

        const comprobante = await this.paymentRepository.findComprobanteById(
          BigInt(detalle.comprobanteId),
          tx,
        );

        if (!comprobante) {
          throw new NotFoundException(
            `Comprobante con ID ${detalle.comprobanteId} no encontrado`,
          );
        }

        const totalAplicado =
          await this.paymentRepository.findComprobanteAppliedSum(
            BigInt(detalle.comprobanteId),
            tx,
          );

        const montoEnSolicitud =
          comprobanteAcumulado.get(detalle.comprobanteId) ?? new Decimal(0);
        const montoAcumulado = montoEnSolicitud.plus(detalle.montoAbonado);
        comprobanteAcumulado.set(detalle.comprobanteId, montoAcumulado);

        if (
          comprobante.importeTotal !== null &&
          new Decimal(totalAplicado)
            .plus(montoAcumulado)
            .greaterThan(comprobante.importeTotal)
        ) {
          throw new BadRequestException(
            `El monto excede el saldo pendiente del comprobante ${detalle.comprobanteId}`,
          );
        }
      }

      if (detalle.tipoPago === TipoDetallePago.CUOTA_CONVENIO) {
        if (!detalle.cuotaConvenioId) {
          throw new BadRequestException(
            'El detalle CUOTA_CONVENIO requiere cuotaConvenioId',
          );
        }

        const cuota = await this.paymentRepository.findCuotaConvenioById(
          BigInt(detalle.cuotaConvenioId),
          tx,
        );

        if (!cuota || cuota.deletedAt) {
          throw new NotFoundException(
            `Cuota de convenio ${detalle.cuotaConvenioId} no encontrada`,
          );
        }

        if (cuota.estado === 'PAGADA') {
          throw new BadRequestException(
            `La cuota ${detalle.cuotaConvenioId} ya está pagada`,
          );
        }
      }

      if (detalle.tipoPago === TipoDetallePago.PAGO_LIBRE) {
        continue;
      }
    }
  }

  private async applyInstallmentPayment(
    tx: TransactionContext,
    cuotaConvenioId: string,
    montoAbonado: number,
    pagoId?: bigint,
  ) {
    const cuota = await this.paymentRepository.findCuotaConvenioById(
      BigInt(cuotaConvenioId),
      tx,
    );

    if (!cuota) {
      throw new NotFoundException(
        `Cuota de convenio ${cuotaConvenioId} no encontrada`,
      );
    }

    if (
      new Decimal(montoAbonado).greaterThan(new Decimal(cuota.saldoPendiente))
    ) {
      throw new BadRequestException(
        `El monto abonado excede el saldo pendiente de la cuota ${cuotaConvenioId}`,
      );
    }

    const nuevoMontoPagado = new Decimal(cuota.montoPagado).plus(montoAbonado);
    const nuevoSaldo = new Decimal(cuota.saldoPendiente).minus(montoAbonado);
    const estaPagada = nuevoSaldo.equals(0);

    const result = await this.paymentRepository.updateCuotaConvenioPayment(
      BigInt(cuotaConvenioId),
      cuota.saldoPendiente,
      {
        montoPagado: nuevoMontoPagado.toNumber(),
        saldoPendiente: nuevoSaldo.toNumber(),
        estado: estaPagada ? 'PAGADA' : 'PENDIENTE',
        pagoCompleto: estaPagada,
        fechaPago: estaPagada ? new Date() : null,
      },
      tx,
    );

    if (result.count === 0) {
      throw new Error(
        `Concurrency conflict on cuota ${cuotaConvenioId}: state changed before write`,
      );
    }

    if (estaPagada && pagoId) {
      await this.eventosPendientesRepository.createPending(
        'cuota.pagada',
        {
          cuotaConvenioId: cuotaConvenioId.toString(),
          pagoId: pagoId.toString(),
          convenioId: cuota.convenioId.toString(),
        },
        'CUOTA_CONVENIO',
        cuotaConvenioId.toString(),
        tx,
      );
    }
  }
}
