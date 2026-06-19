import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoConvenio, EstadoCuotaConvenio } from 'src/shared/enums';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { CreateAgreementDto } from '../interfaces/dto/create-agreement.dto';
import { AgreementResponseDto } from '../interfaces/dto/agreement-response.dto';
import { InstallmentResponseDto } from '../interfaces/dto/installment-response.dto';
import { DebtSummaryResponseDto } from '../interfaces/dto/debt-summary-response.dto';
import { AgreementStateResponseDto } from '../interfaces/dto/agreement-state-response.dto';
import { InstallmentStateResponseDto } from '../interfaces/dto/installment-state-response.dto';
import {
  safeInstallmentSelect,
  safeAgreementSelect,
  safeAgreementWithInstallmentsSelect,
} from '../domain/types/IAgreement';
import {
  toAgreementResponse,
  toInstallmentResponse,
} from '../domain/types/agreementsMapper';
import { CreateAgreementUseCase } from './use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';
import { UpdateAgreementUseCase } from './use-cases/update-agreement.use-case';
import { GetPaymentAgreementPdfDataUseCase } from './use-cases/get-payment-agreement-pdf-data.use-case';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';

@Injectable()
export class AgreementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateAgreementUseCase,
    private readonly findOneUseCase: FindOneAgreementUseCase,
    private readonly getDebtSummaryUseCase: GetDebtSummaryUseCase,
    private readonly updateUseCase: UpdateAgreementUseCase,
    private readonly getPdfDataUseCase: GetPaymentAgreementPdfDataUseCase,
    private readonly generatePdfUc: GeneratePdfUseCase,
  ) {}

  // ── Estado catalogs ──────────────────────────────────────────────────────

  async findAllAgreementStates(): Promise<AgreementStateResponseDto[]> {
    return Object.values(EstadoConvenio).map((codigo) => ({ codigo }));
  }

  async findAllInstallmentStates(): Promise<InstallmentStateResponseDto[]> {
    return Object.values(EstadoCuotaConvenio).map((codigo) => ({ codigo }));
  }

  // ── Debt ─────────────────────────────────────────────────────────────────

  async getDebtSummary(contratoId: bigint): Promise<DebtSummaryResponseDto> {
    return this.getDebtSummaryUseCase.execute(contratoId);
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

  async findOne(id: bigint): Promise<AgreementResponseDto> {
    const convenio = await this.findOneUseCase.execute(id);
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
    id: bigint,
    dto: { estado: string },
  ): Promise<AgreementResponseDto> {
    const convenio = await this.updateUseCase.execute(id, dto.estado);
    return toAgreementResponse(convenio);
  }

  async cancel(id: bigint): Promise<AgreementResponseDto> {
    await this.findOneUseCase.execute(id);

    const updated = await this.prisma.convenios.update({
      where: { convenioId: id },
      data: {
        estado: 'ANULADO',
        deletedAt: new Date(),
      },
      select: safeAgreementWithInstallmentsSelect,
    });

    return toAgreementResponse(updated);
  }

  // ── PDF ──────────────────────────────────────────────────────────────────

  async generatePdf(convenioId: bigint): Promise<Buffer> {
    const raw = await this.getPdfDataUseCase.execute(convenioId);
    return this.generatePdfUc.execute('payment-agreement', raw as any);
  }
}
