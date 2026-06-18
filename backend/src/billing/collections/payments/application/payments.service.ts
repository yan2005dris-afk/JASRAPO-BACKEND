import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { Banco, EstadoPago } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { paginate, PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { CreatePaymentDto, ApplySaldoFavorDto } from '../interfaces/dto/create-payment.dto';
import { UpdatePaymentStateDto } from '../interfaces/dto/update-payment-state.dto';
import { FindAllPaymentsDto } from '../interfaces/dto/find-all-payments.dto';
import { PaymentResponseDto } from '../interfaces/dto/payment-response.dto';
import { SaldoFavorResponseDto } from '../interfaces/dto/saldo-favor-response.dto';
import { PaymentStateResponseDto } from '../interfaces/dto/payment-state-response.dto';
import { BankResponseDto } from '../interfaces/dto/bank-response.dto';
import {
  safePaymentSelect,
  safePaymentWithDetailSelect,
  safeSaldoFavorSelect,
} from '../domain/types/IPayment';
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
  [Banco.Diners]: 'Diners Club',
  [Banco.Mastercard]: 'Mastercard',
  [Banco.Visa]: 'Visa',
  [Banco.AMEX]: 'American Express',
  [Banco.OTRO]: 'Otro banco/no especificado',
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreatePaymentUseCase,
    private readonly findOneUseCase: FindOnePaymentUseCase,
    private readonly validatePaymentUseCase: ValidatePaymentUseCase,
    private readonly annulPaymentUseCase: AnnulPaymentUseCase,
    private readonly applySaldoFavorUseCase: ApplySaldoFavorUseCase,
  ) {}

  async create(dto: CreatePaymentDto, creadoPor?: string): Promise<PaymentResponseDto> {
    const pago = await this.createUseCase.execute(dto, creadoPor);
    return toPaymentResponse(pago);
  }

  async findAll(
    params: FindAllPaymentsDto & PaginateOptions & { pagination?: PaginateOptions },
  ): Promise<PaginatedResult<PaymentResponseDto>> {
    const pagination = params.pagination ?? { page: params.page, limit: params.limit };
    const where: Prisma.PagosWhereInput = {
      deletedAt: null,
      ...(params.clienteId ? { clienteId: BigInt(params.clienteId) } : {}),
      ...(params.estadoPago ? { estadoPago: params.estadoPago } : {}),
      ...(params.banco ? { banco: params.banco } : {}),
      ...this.buildDateFilter(params.fechaDesde, params.fechaHasta),
    };

    const result = await paginate<any>(
      this.prisma.pagos,
      {
        where,
        select: safePaymentSelect,
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
    const pago = await this.validatePaymentUseCase.execute(id, dto, actualizadoPor);
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

  async findSaldoFavorByCliente(clienteId: bigint): Promise<SaldoFavorResponseDto[]> {
    const saldos = await this.prisma.saldoFavorCliente.findMany({
      where: {
        clienteId,
        deletedAt: null,
        disponibleParaAplicar: true,
      },
      select: safeSaldoFavorSelect,
      orderBy: { createdAt: 'desc' },
    });

    return saldos.map(toSaldoFavorResponse);
  }

  async findPaymentStates(): Promise<PaymentStateResponseDto[]> {
    return Object.values(EstadoPago).map((codigo) => ({ codigo }));
  }

  async findBankCatalog(): Promise<BankResponseDto[]> {
    return Object.values(Banco).map((codigo) => {
      const banco = codigo as Banco;
      return {
        codigo: banco,
        descripcion: BANK_DESCRIPTIONS[banco],
      };
    });
  }

  async getDailyCashSummary(params: { fecha?: string; cajaId?: string }) {
    const fechaBase = params.fecha ? new Date(params.fecha) : new Date();
    const start = new Date(fechaBase);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fechaBase);
    end.setHours(23, 59, 59, 999);

    const pagos = await this.prisma.pagos.findMany({
      where: {
        deletedAt: null,
        estadoPago: EstadoPago.REGISTRADO,
        fechaPago: { gte: start, lte: end },
        ...(params.cajaId ? { cajaId: BigInt(params.cajaId) } : {}),
      },
      select: safePaymentWithDetailSelect,
      orderBy: { fechaPago: 'asc' },
    });

    const porTipoDetalle = new Map<string, number>();
    const porTipoComprobante = new Map<string, number>();
    let total = 0;

    for (const pago of pagos) {
      total += Number(pago.montoTotalRecibido);
      for (const detalle of pago.detallePago ?? []) {
        const monto = Number(detalle.montoAbonado);
        porTipoDetalle.set(
          detalle.tipoPago,
          (porTipoDetalle.get(detalle.tipoPago) ?? 0) + monto,
        );

        const tipoComprobante = detalle.comprobante?.tipoComprobante ?? 'SIN_COMPROBANTE';
        porTipoComprobante.set(
          tipoComprobante,
          (porTipoComprobante.get(tipoComprobante) ?? 0) + monto,
        );
      }
    }

    return {
      fecha: start.toISOString().slice(0, 10),
      cajaId: params.cajaId ?? null,
      totalPagos: pagos.length,
      totalRecaudado: Number(total.toFixed(2)),
      desglosePorTipoDetalle: this.mapToBreakdown(porTipoDetalle),
      desglosePorTipoComprobante: this.mapToBreakdown(porTipoComprobante),
    };
  }

  private buildDateFilter(fechaDesde?: string, fechaHasta?: string): Prisma.PagosWhereInput {
    if (!fechaDesde && !fechaHasta) return {};

    return {
      fechaPago: {
        ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
        ...(fechaHasta ? { lte: new Date(fechaHasta) } : {}),
      },
    };
  }

  private mapToBreakdown(map: Map<string, number>) {
    return Array.from(map.entries()).map(([codigo, total]) => ({
      codigo,
      total: Number(total.toFixed(2)),
    }));
  }
}
