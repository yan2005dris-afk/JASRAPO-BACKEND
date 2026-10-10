import { Injectable } from '@nestjs/common';
import { EstadoPago, Banco, TarjetaCredito } from 'src/shared/enums';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { CreateCobroPuntualUseCase } from './use-cases/create-cobro-puntual.use-case';
import { FindOnePaymentUseCase } from './use-cases/find-one-payment.use-case';
import { ValidatePaymentUseCase } from './use-cases/validate-payment.use-case';
import { AnnulPaymentUseCase } from './use-cases/annul-payment.use-case';
import { ApplySaldoFavorUseCase } from './use-cases/apply-saldo-favor.use-case';
import { GetDailyCashSummaryUseCase } from './use-cases/get-daily-cash-summary.use-case';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import type {
  DailyCashSummaryParams,
  DailyCashSummaryResult,
} from '../domain/types/payment.types';
import type { PaymentRow } from '../domain/types/payment.types';
import type { SaldoFavorRow } from '../domain/types/payment.types';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type {
  CreatePaymentDto,
  ApplySaldoFavorDto,
} from '../interfaces/dto/create-payment.dto';
import type { CreateCobroPuntualDto } from '../interfaces/dto/create-cobro-puntual.dto';
import type { PaymentStateResponseDto } from '../interfaces/dto/payment-state-response.dto';
import type { BankResponseDto } from '../interfaces/dto/bank-response.dto';
import type { CardBrandResponseDto } from '../interfaces/dto/card-brand-response.dto';

import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly createUseCase: CreatePaymentUseCase,
    private readonly createCobroPuntualUseCase: CreateCobroPuntualUseCase,
    private readonly findOneUseCase: FindOnePaymentUseCase,
    private readonly validatePaymentUseCase: ValidatePaymentUseCase,
    private readonly annulPaymentUseCase: AnnulPaymentUseCase,
    private readonly applySaldoFavorUseCase: ApplySaldoFavorUseCase,
    private readonly getDailyCashSummaryUseCase: GetDailyCashSummaryUseCase,
    private readonly storageService: StorageService,
  ) {}

  async uploadComprobante(
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de comprobante no válido. Solo se admiten JPG, PNG, WEBP o PDF',
      );
    }

    const ext =
      file.originalname?.split('.').pop() ||
      (file.mimetype === 'application/pdf' ? 'pdf' : 'jpg');
    const key = `comprobantes/${Date.now()}-${randomUUID()}.${ext}`;

    await this.storageService.upload(
      SRI_STORAGE_TYPES.COMPROBANTES,
      key,
      file.buffer,
      { contentType: file.mimetype },
    );

    const url = await this.storageService.getUrl(
      SRI_STORAGE_TYPES.COMPROBANTES,
      key,
      3600,
    );

    return { key, url };
  }

  async getComprobanteUrl(key: string): Promise<string> {
    if (!key) {
      throw new BadRequestException('Clave de comprobante no especificada');
    }
    return this.storageService.getUrl(
      SRI_STORAGE_TYPES.COMPROBANTES,
      key,
      3600,
    );
  }

  async create(dto: CreatePaymentDto, creadoPor: string): Promise<PaymentRow> {
    return this.createUseCase.execute(dto, creadoPor);
  }

  async createCobroPuntual(
    dto: CreateCobroPuntualDto,
    creadoPor: string,
  ): Promise<PaymentRow> {
    return this.createCobroPuntualUseCase.execute(dto, creadoPor);
  }

  async findAll(params: {
    clienteId?: string;
    estadoPago?: string;
    banco?: string;
    tarjetaCredito?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    pagination?: PaginateOptions;
  }): Promise<PaginatedResult<PaymentRow>> {
    const { pagination = { page: 1, limit: 10 }, ...filters } = params;
    return this.paymentRepository.paginate(pagination, filters);
  }

  async findOne(pagoId: bigint): Promise<PaymentRow> {
    return this.findOneUseCase.execute(pagoId);
  }

  async updateState(
    pagoId: bigint,
    dto: { estadoPago: EstadoPago; motivo?: string },
    actualizadoPor?: string,
  ): Promise<PaymentRow> {
    return this.validatePaymentUseCase.execute(pagoId, dto, actualizadoPor);
  }

  async annul(
    pagoId: bigint,
    dto: { motivoAnulacion: string; anuladoPor?: string },
  ): Promise<PaymentRow> {
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

  async findSaldoFavorByCliente(clienteId: bigint): Promise<SaldoFavorRow[]> {
    return this.paymentRepository.findSaldoFavorByCliente(clienteId);
  }

  async applySaldoFavor(
    dto: ApplySaldoFavorDto,
    creadoPor?: string,
  ): Promise<PaymentRow> {
    return this.applySaldoFavorUseCase.execute(dto, creadoPor);
  }

  async getDailyCashSummary(
    params: DailyCashSummaryParams,
  ): Promise<DailyCashSummaryResult> {
    return this.getDailyCashSummaryUseCase.execute(params);
  }
}
