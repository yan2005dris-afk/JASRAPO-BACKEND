import { Injectable } from '@nestjs/common';
import { EstadoPago, Banco, TarjetaCredito } from 'src/generated/prisma/enums';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { FindOnePaymentUseCase } from './use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './use-cases/apply-saldo-favor.use-case';
import { GetDailyCashSummaryUseCase } from './use-cases/get-daily-cash-summary.use-case';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import type {
  DailyCashSummaryParams,
  PaymentFilters,
  DailyCashSummaryResult,
} from '../domain/types/payment.types';
import type { PaymentEntity } from '../domain/entities/payment.entity';
import type { SaldoFavorEntity } from '../domain/entities/saldo-favor.entity';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type {
  CreatePaymentDto,
  ApplySaldoFavorDto,
} from '../interfaces/dto/create-payment.dto';
import type { PaymentStateResponseDto } from '../interfaces/dto/payment-state-response.dto';
import type { BankResponseDto } from '../interfaces/dto/bank-response.dto';
import type { CardBrandResponseDto } from '../interfaces/dto/card-brand-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly createUseCase: CreatePaymentUseCase,
    private readonly findOneUseCase: FindOnePaymentUseCase,
    private readonly validatePaymentUseCase: ValidatePaymentUseCase,
    private readonly annulPaymentUseCase: AnnulPaymentUseCase,
    private readonly applySaldoFavorUseCase: ApplySaldoFavorUseCase,
    private readonly getDailyCashSummaryUseCase: GetDailyCashSummaryUseCase,
  ) {}

  async create(
    dto: CreatePaymentDto,
    creadoPor: string,
  ): Promise<PaymentEntity> {
    return this.createUseCase.execute(dto, creadoPor);
  }

  async findAll(params: {
    clienteId?: string;
    estadoPago?: string;
    banco?: string;
    tarjetaCredito?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    pagination?: PaginateOptions;
  }): Promise<PaginatedResult<PaymentEntity>> {
    const { pagination = { page: 1, limit: 10 }, ...filters } = params;
    return this.paymentRepository.paginate(pagination, filters);
  }

  async findOne(pagoId: bigint): Promise<PaymentEntity> {
    return this.findOneUseCase.execute(pagoId);
  }

  async updateState(
    pagoId: bigint,
    dto: { estadoPago: EstadoPago; motivo?: string },
    actualizadoPor?: string,
  ): Promise<PaymentEntity> {
    return this.validatePaymentUseCase.execute(pagoId, dto, actualizadoPor);
  }

  async annul(
    pagoId: bigint,
    dto: { motivoAnulacion: string; anuladoPor?: string },
  ): Promise<PaymentEntity> {
    return this.annulPaymentUseCase.execute(pagoId, dto);
  }

  async findPaymentStates(): Promise<PaymentStateResponseDto[]> {
    return Object.values(EstadoPago).map((codigo) => ({ codigo }));
  }

  async findBankCatalog(): Promise<BankResponseDto[]> {
    return Object.values(Banco).map((codigo) => ({
      codigo,
      descripcion: codigo,
    }));
  }

  async findCardBrandCatalog(): Promise<CardBrandResponseDto[]> {
    return Object.values(TarjetaCredito).map((codigo) => ({
      codigo,
      descripcion: codigo,
    }));
  }

  async findSaldoFavorByCliente(
    clienteId: bigint,
  ): Promise<SaldoFavorEntity[]> {
    return this.paymentRepository.findSaldoFavorByCliente(clienteId);
  }

  async applySaldoFavor(
    dto: ApplySaldoFavorDto,
    creadoPor?: string,
  ): Promise<PaymentEntity> {
    return this.applySaldoFavorUseCase.execute(dto, creadoPor);
  }

  async getDailyCashSummary(
    params: DailyCashSummaryParams,
  ): Promise<DailyCashSummaryResult> {
    return this.getDailyCashSummaryUseCase.execute(params);
  }
}
