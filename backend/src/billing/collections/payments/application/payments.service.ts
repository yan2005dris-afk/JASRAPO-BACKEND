import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { Prisma } from 'src/generated/prisma/client';
import { Banco, EstadoPago, TarjetaCredito } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import {
  CreatePaymentDto,
  ApplySaldoFavorDto,
} from '../interfaces/dto/create-payment.dto';
import { UpdatePaymentStateDto } from '../interfaces/dto/update-payment-state.dto';
import { FindAllPaymentsDto } from '../interfaces/dto/find-all-payments.dto';
import { PaymentResponseDto } from '../interfaces/dto/payment-response.dto';
import { SaldoFavorResponseDto } from '../interfaces/dto/saldo-favor-response.dto';
import { PaymentStateResponseDto } from '../interfaces/dto/payment-state-response.dto';
import { BankResponseDto } from '../interfaces/dto/bank-response.dto';
import { CardBrandResponseDto } from '../interfaces/dto/card-brand-response.dto';

import { PaymentRepository } from '../domain/repositories/payment.repository';
import {
  toPaymentResponse,
  toSaldoFavorResponse,
} from '../domain/types/paymentsMapper';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { FindOnePaymentUseCase } from './use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './use-cases/apply-saldo-favor.use-case';

const BANK_DESCRIPTIONS: Record<Banco, string> = {
  [Banco.PICHINCHA]: 'Banco Pichincha',
  [Banco.GUAYAQUIL]: 'Banco de Guayaquil',
  [Banco.PRODUBANC]: 'Produbanco',
  [Banco.PACIFICIO]: 'Banco del Pacífico',
  [Banco.BOLIVARIANO]: 'Banco Bolivariano',
  [Banco.LOJA]: 'Banco de Loja',
  [Banco.AUSTRO]: 'Banco del Austro',
  [Banco.RUMIÑAHUI]: 'Banco Rumiñahui',
  [Banco.CNT]: 'CNT',
  [Banco.OTRO]: 'Otro banco/no especificado',
};

const CARD_BRAND_DESCRIPTIONS: Record<TarjetaCredito, string> = {
  [TarjetaCredito.DINERS]: 'Diners Club',
  [TarjetaCredito.MASTERCARD]: 'Mastercard',
  [TarjetaCredito.VISA]: 'Visa',
  [TarjetaCredito.AMEX]: 'American Express',
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
    private readonly createUseCase: CreatePaymentUseCase,
    private readonly findOneUseCase: FindOnePaymentUseCase,
    private readonly validatePaymentUseCase: ValidatePaymentUseCase,
    private readonly annulPaymentUseCase: AnnulPaymentUseCase,
    private readonly applySaldoFavorUseCase: ApplySaldoFavorUseCase,
  ) {}

  async create(
    dto: CreatePaymentDto,
    creadoPor?: string,
  ): Promise<PaymentResponseDto> {
    const pago = await this.createUseCase.execute(dto, creadoPor);
    return toPaymentResponse(pago);
  }

  async findAll(
    params: FindAllPaymentsDto &
      PaginateOptions & { pagination?: PaginateOptions },
  ): Promise<PaginatedResult<PaymentResponseDto>> {
    const pagination = params.pagination ?? {
      page: params.page,
      limit: params.limit,
    };
    const where: Prisma.PagosWhereInput = {
      deletedAt: null,
      ...(params.clienteId ? { clienteId: BigInt(params.clienteId) } : {}),
      ...(params.estadoPago ? { estadoPago: params.estadoPago } : {}),
      ...(params.banco ? { banco: params.banco } : {}),
      ...(params.tarjetaCredito
        ? { tarjetaCredito: params.tarjetaCredito }
        : {}),
      ...this.buildDateFilter(params.fechaDesde, params.fechaHasta),
    };

    const result = await paginate<any>(
      this.prisma.pagos,
      {
        where,
        orderBy: { fechaPago: 'desc' },
      },
      pagination,
    );

    return {
      ...result,
      data: result.data.map(toPaymentResponse),
    };
  }

  async findOne(id: bigint): Promise<PaymentResponseDto> {
    const pago = await this.findOneUseCase.execute(id);
    return toPaymentResponse(pago);
  }

  async updateState(
    id: bigint,
    dto: UpdatePaymentStateDto,
    actualizadoPor?: string,
  ): Promise<PaymentResponseDto> {
    const pago = await this.validatePaymentUseCase.execute(
      id,
      dto,
      actualizadoPor,
    );
    return toPaymentResponse(pago);
  }

  async annul(
    id: bigint,
    dto: { motivoAnulacion: string; anuladoPor?: string },
  ): Promise<PaymentResponseDto> {
    const pago = await this.annulPaymentUseCase.execute(id, dto);
    return toPaymentResponse(pago);
  }

  async applySaldoFavor(
    dto: ApplySaldoFavorDto,
    creadoPor?: string,
  ): Promise<PaymentResponseDto> {
    const pago = await this.applySaldoFavorUseCase.execute(dto, creadoPor);
    return toPaymentResponse(pago);
  }

  async findSaldoFavorByCliente(
    clienteId: bigint,
  ): Promise<SaldoFavorResponseDto[]> {
    const saldos = await this.prisma.saldoFavorCliente.findMany({
      where: {
        clienteId,
        deletedAt: null,
        disponibleParaAplicar: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return saldos.map(toSaldoFavorResponse);
  }

  async findPaymentStates(): Promise<PaymentStateResponseDto[]> {
    return Object.values(EstadoPago).map((codigo) => ({ codigo }));
  }

  async findBankCatalog(): Promise<BankResponseDto[]> {
    return Object.values(Banco).map((codigo) => {
      const banco = codigo;
      return {
        codigo: banco,
        descripcion: BANK_DESCRIPTIONS[banco],
      };
    });
  }

  async findCardBrandCatalog(): Promise<CardBrandResponseDto[]> {
    return Object.values(TarjetaCredito).map((codigo) => {
      const brand = codigo;
      return {
        codigo: brand,
        descripcion: CARD_BRAND_DESCRIPTIONS[brand],
      };
    });
  }

  async getDailyCashSummary(params: { fecha?: string; cajaId?: string }) {
    const fechaBase = params.fecha ? new Date(params.fecha) : new Date();
    const start = new Date(fechaBase);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fechaBase);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);

    const pagos = await this.paymentRepository.findManyPagos({
      where: {
        deletedAt: null,
        estadoPago: EstadoPago.REGISTRADO,
        fechaPago: { gte: start, lt: end },
        ...(params.cajaId ? { cajaId: BigInt(params.cajaId) } : {}),
      },
      orderBy: { fechaPago: 'asc' },
    });

    const porTipoDetalle = new Map<string, Decimal>();
    const porTipoComprobante = new Map<string, Decimal>();
    let total = new Decimal(0);

    for (const pago of pagos) {
      total = total.plus(pago.montoTotalRecibido);
      for (const detalle of pago.detallePago ?? []) {
        const monto = new Decimal(detalle.montoAbonado);
        porTipoDetalle.set(
          detalle.tipoPago,
          (porTipoDetalle.get(detalle.tipoPago) ?? new Decimal(0)).plus(monto),
        );

        const tipoComprobante =
          detalle.comprobante?.tipoComprobante ?? 'SIN_COMPROBANTE';
        porTipoComprobante.set(
          tipoComprobante,
          (porTipoComprobante.get(tipoComprobante) ?? new Decimal(0)).plus(
            monto,
          ),
        );
      }
    }

    return {
      fecha: start.toISOString().slice(0, 10),
      cajaId: params.cajaId ?? null,
      totalPagos: pagos.length,
      totalRecaudado: total.toNumber(),
      desglosePorTipoDetalle: this.mapToBreakdown(porTipoDetalle),
      desglosePorTipoComprobante: this.mapToBreakdown(porTipoComprobante),
    };
  }

  private buildDateFilter(
    fechaDesde?: string,
    fechaHasta?: string,
  ): Prisma.PagosWhereInput {
    if (!fechaDesde && !fechaHasta) return {};

    return {
      fechaPago: {
        ...(fechaDesde
          ? {
              gte: (() => {
                const d = new Date(fechaDesde);
                d.setHours(0, 0, 0, 0);
                return d;
              })(),
            }
          : {}),
        ...(fechaHasta
          ? {
              lt: (() => {
                const d = new Date(fechaHasta);
                d.setDate(d.getDate() + 1);
                d.setHours(0, 0, 0, 0);
                return d;
              })(),
            }
          : {}),
      },
    };
  }

  private mapToBreakdown(map: Map<string, Decimal>) {
    return Array.from(map.entries()).map(([codigo, total]) => ({
      codigo,
      total: total.toNumber(),
    }));
  }
}
