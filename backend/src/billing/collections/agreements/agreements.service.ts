import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  EstadoConvenio,
  EstadoCuotaConvenio,
} from '../../../generated/prisma/enums';
import {
  paginate,
  PaginateOptions,
} from '../../../infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from '../../../infrastructure/common/types/paginated-result.type';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { AgreementResponseDto } from './dto/agreement-response.dto';
import { InstallmentResponseDto } from './dto/installment-response.dto';
import { DebtSummaryResponseDto } from './dto/debt-summary-response.dto';
import { AgreementStateResponseDto } from './dto/agreement-state-response.dto';
import { InstallmentStateResponseDto } from './dto/installment-state-response.dto';
import {
  safeInstallmentSelect,
  safeAgreementSelect,
  safeAgreementWithInstallmentsSelect,
} from './types/IAgreement';
import {
  toAgreementResponse,
  toInstallmentResponse,
} from './types/agreementsMapper';
import { CreateAgreementUseCase } from './use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';
import { UpdateAgreementUseCase } from './use-cases/update-agreement.use-case';

@Injectable()
export class AgreementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateAgreementUseCase,
    private readonly findOneUseCase: FindOneAgreementUseCase,
    private readonly getDebtSummaryUseCase: GetDebtSummaryUseCase,
    private readonly updateUseCase: UpdateAgreementUseCase,
  ) {}

  // ── Estado catalogs ──────────────────────────────────────────────────────

  async findAllAgreementStates(): Promise<AgreementStateResponseDto[]> {
    return Object.values(EstadoConvenio).map((codigo) => ({ codigo }));
  }

  async findAllInstallmentStates(): Promise<InstallmentStateResponseDto[]> {
    return Object.values(EstadoCuotaConvenio).map((codigo) => ({ codigo }));
  }

  // ── Debt ─────────────────────────────────────────────────────────────────

  async getDebtSummary(contratoId: string): Promise<DebtSummaryResponseDto> {
    return this.getDebtSummaryUseCase.execute(BigInt(contratoId));
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  async create(dto: CreateAgreementDto): Promise<AgreementResponseDto> {
    const convenio = await this.createUseCase.execute(dto);
    return toAgreementResponse(convenio);
  }

  async findAll(params: {
    pagination: PaginateOptions;
    contratoId?: string;
  }): Promise<PaginatedResult<AgreementResponseDto>> {
    const { pagination, contratoId } = params;

    const result = await paginate<any>(
      this.prisma.convenios,
      {
        where: {
          deletedAt: null,
          ...(contratoId ? { contratoId: BigInt(contratoId) } : {}),
        },
        select: safeAgreementSelect,
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );

    return {
      ...result,
      data: result.data.map(toAgreementResponse),
    };
  }

  async findOne(id: string): Promise<AgreementResponseDto> {
    const convenio = await this.findOneUseCase.execute(BigInt(id));
    return toAgreementResponse(convenio);
  }

  async findInstallments(
    convenioId: string,
  ): Promise<InstallmentResponseDto[]> {
    await this.findOneUseCase.execute(BigInt(convenioId));

    const cuotas = await this.prisma.cuotaConvenio.findMany({
      where: { convenioId: BigInt(convenioId), deletedAt: null },
      select: safeInstallmentSelect,
      orderBy: { numeroCuota: 'asc' },
    });

    return cuotas.map(toInstallmentResponse);
  }

  async update(
    id: string,
    dto: { estado: string },
  ): Promise<AgreementResponseDto> {
    const convenio = await this.updateUseCase.execute(BigInt(id), dto.estado);
    return toAgreementResponse(convenio);
  }

  async cancel(id: string): Promise<AgreementResponseDto> {
    await this.findOneUseCase.execute(BigInt(id));

    const updated = await this.prisma.convenios.update({
      where: { convenioId: BigInt(id) },
      data: {
        estado: 'ANULADO',
        deletedAt: new Date(),
      },
      select: safeAgreementWithInstallmentsSelect,
    });

    return toAgreementResponse(updated);
  }
}
