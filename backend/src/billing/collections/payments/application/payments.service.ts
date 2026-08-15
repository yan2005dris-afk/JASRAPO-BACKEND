import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { Banco, EstadoPago, TarjetaCredito } from 'src/generated/prisma/enums';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import {
  CreatePaymentDto,
  ApplySaldoFavorDto,
} from '../interfaces/dto/create-payment.dto';
import { UpdatePaymentStateDto } from '../interfaces/dto/update-payment-state.dto';
import { FindAllPaymentsDto } from '../interfaces/dto/find-all-payments.dto';
import { PaymentStateResponseDto } from '../interfaces/dto/payment-state-response.dto';
import { BankResponseDto } from '../interfaces/dto/bank-response.dto';
import { CardBrandResponseDto } from '../interfaces/dto/card-brand-response.dto';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import type { PaymentEntity } from '../domain/entities/payment.entity';
import type { SaldoFavorEntity } from '../domain/entities/saldo-favor.entity';
import type { DailyCashSummaryResult } from '../domain/types/payment.types';
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
  ): Promise<PaymentEntity> {
    return this.createUseCase.execute(dto, creadoPor);
  }

  async findAll(
    params: FindAllPaymentsDto &
      PaginateOptions & { pagination?: PaginateOptions },
  ): Promise<PaginatedResult<PaymentEntity>> {
    const pagination = params.pagination ?? {
      page: params.page,
      limit: params.limit,
    };

    return this.paymentRepository.paginate(pagination, {
      clienteId: params.clienteId,
      estadoPago: params.estadoPago,
      banco: params.banco,
      tarjetaCredito: params.tarjetaCredito,
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
    });
  }

  async findOne(id: bigint): Promise<PaymentEntity> {
    return this.findOneUseCase.execute(id);
  }

  async updateState(
    id: bigint,
    dto: UpdatePaymentStateDto,
    actualizadoPor?: string,
  ): Promise<PaymentEntity> {
    return this.validatePaymentUseCase.execute(id, dto, actualizadoPor);
  }

  async annul(
    id: bigint,
    dto: { motivoAnulacion: string; anuladoPor?: string },
  ): Promise<PaymentEntity> {
    return this.annulPaymentUseCase.execute(id, dto);
  }

  async applySaldoFavor(
    dto: ApplySaldoFavorDto,
    creadoPor?: string,
  ): Promise<PaymentEntity> {
    return this.applySaldoFavorUseCase.execute(dto, creadoPor);
  }

  async findSaldoFavorByCliente(
    clienteId: bigint,
  ): Promise<SaldoFavorEntity[]> {
    return this.paymentRepository.findSaldoFavorByCliente(clienteId);
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

  async getDailyCashSummary(params: {
    fecha?: string;
    cajaId?: string;
  }): Promise<DailyCashSummaryResult> {
    const fechaBase = params.fecha ? new Date(params.fecha) : new Date();
    const start = new Date(fechaBase);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fechaBase);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);

    const pagos = await this.paymentRepository.findDailyCashPayments({
      fechaInicio: start,
      fechaFin: end,
      cajaId: params.cajaId ? BigInt(params.cajaId) : undefined,
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

  private mapToBreakdown(map: Map<string, Decimal>) {
    return Array.from(map.entries()).map(([codigo, totalAmount]) => ({
      codigo,
      total: totalAmount.toNumber(),
    }));
  }
}
