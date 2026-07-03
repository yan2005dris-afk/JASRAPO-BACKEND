import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import type { Prisma } from 'src/generated/prisma/client';
import {
  EstadoCaja,
  EstadoPago,
  EstadoCuotaConvenio,
  TipoDetallePago,
  TipoOrigenAbono,
} from 'src/generated/prisma/enums';
import { CreatePaymentDto } from '../../interfaces/dto/create-payment.dto';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { safePaymentWithDetailSelect } from '../../domain/types/IPayment';

@Injectable()
export class CreatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(dto: CreatePaymentDto, creadoPor = 'SYSTEM') {
    await this.validateHeader(dto);
    this.validateTotals(dto);

    const pagoId = await this.paymentRepository.executeTransaction(
      async (tx) => {
        await this.validateDetails(dto, tx);

        const pago = await this.paymentRepository.createPago(
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
            estadoPago: EstadoPago.PENDIENTE,
            creadoPor,
          },
          { pagoId: true },
          tx,
        );

        await this.paymentRepository.createManyDetallePago(
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
            );
          }

          if (detalle.tipoPago === TipoDetallePago.SALDO_FAVOR) {
            await this.paymentRepository.createSaldoFavor(
              {
                clienteId: BigInt(dto.clienteId),
                pagoId: pago.pagoId,
                montoSaldo: detalle.montoAbonado,
                tipoOrigen: TipoOrigenAbono.PAGO_EXCESO,
                disponibleParaAplicar: true,
              },
              undefined,
              tx,
            );
          }
        }

        return pago.pagoId;
      },
    );

    return this.paymentRepository.findUniquePago(
      { pagoId },
      safePaymentWithDetailSelect,
    );
  }

  private async validateHeader(dto: CreatePaymentDto) {
    const cliente = await this.paymentRepository.findUniqueCliente(
      { clienteId: BigInt(dto.clienteId) },
      { clienteId: true },
    );

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${dto.clienteId} no encontrado`,
      );
    }

    if (!dto.cajaId) return;

    const caja = await this.paymentRepository.findFirstCajaSesion(
      { cajaId: BigInt(dto.cajaId), estado: EstadoCaja.ABIERTA },
      { cajaId: true },
    );

    if (!caja) {
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

  private async validateDetails(
    dto: CreatePaymentDto,
    tx: Prisma.TransactionClient,
  ) {
    const comprobanteAcumulado = new Map<string, Decimal>();

    for (const detalle of dto.detalle) {
      if (detalle.tipoPago === TipoDetallePago.COMPROBANTE) {
        if (!detalle.comprobanteId) {
          throw new BadRequestException(
            'El detalle COMPROBANTE requiere comprobanteId',
          );
        }

        const comprobante = await this.paymentRepository.findUniqueComprobante(
          { id: BigInt(detalle.comprobanteId) },
          { id: true, importeTotal: true },
          tx,
        );

        if (!comprobante) {
          throw new NotFoundException(
            `Comprobante con ID ${detalle.comprobanteId} no encontrado`,
          );
        }

        const pagosAplicados = await this.paymentRepository.findManyDetallePago(
          {
            where: {
              comprobanteId: BigInt(detalle.comprobanteId),
              deletedAt: null,
              pago: {
                deletedAt: null,
                estadoPago: { not: EstadoPago.ANULADO },
              },
            },
            select: { montoAbonado: true },
          },
          tx,
        );

        const totalAplicado = pagosAplicados.reduce(
          (acc, item) => acc.plus(item.montoAbonado),
          new Decimal(0),
        );

        const montoEnSolicitud =
          comprobanteAcumulado.get(detalle.comprobanteId) ?? new Decimal(0);
        const montoAcumulado = montoEnSolicitud.plus(detalle.montoAbonado);
        comprobanteAcumulado.set(detalle.comprobanteId, montoAcumulado);

        if (
          comprobante.importeTotal &&
          totalAplicado
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

        const cuota = await this.paymentRepository.findUniqueCuotaConvenio(
          { cuotaConvenioId: BigInt(detalle.cuotaConvenioId) },
          {
            cuotaConvenioId: true,
            estado: true,
            deletedAt: true,
            saldoPendiente: true,
          },
          tx,
        );

        if (!cuota || cuota.deletedAt) {
          throw new NotFoundException(
            `Cuota de convenio ${detalle.cuotaConvenioId} no encontrada`,
          );
        }

        if (cuota.estado === EstadoCuotaConvenio.PAGADA) {
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
    tx: Prisma.TransactionClient,
    cuotaConvenioId: string,
    montoAbonado: number,
  ) {
    const cuota = await this.paymentRepository.findUniqueCuotaConvenio(
      { cuotaConvenioId: BigInt(cuotaConvenioId) },
      {
        cuotaConvenioId: true,
        montoPagado: true,
        saldoPendiente: true,
      },
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

    await this.paymentRepository.updateCuotaConvenio(
      { cuotaConvenioId: BigInt(cuotaConvenioId) },
      {
        montoPagado: nuevoMontoPagado.toNumber(),
        saldoPendiente: nuevoSaldo.toNumber(),
        estado: estaPagada
          ? EstadoCuotaConvenio.PAGADA
          : EstadoCuotaConvenio.PENDIENTE,
        pagoCompleto: estaPagada,
        fechaPago: estaPagada ? new Date() : null,
      },
      tx,
    );
  }
}
