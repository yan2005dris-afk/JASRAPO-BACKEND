import { Injectable } from '@nestjs/common';
import { EstadoConvenio, EstadoCuotaConvenio } from 'src/shared/enums';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import { CreateAgreementDto } from '../interfaces/dto/create-agreement.dto';
import { DebtSummaryResponseDto } from '../interfaces/dto/debt-summary-response.dto';
import {
  EnumStateDto,
  buildStateCatalog,
} from 'src/shared/enums/state-catalog';
import { AgreementRepository } from '../domain/repositories/agreement.repository';
import type { AgreementEntity } from '../domain/entities/agreement.entity';
import type { InstallmentEntity } from '../domain/entities/installment.entity';
import { CreateAgreementUseCase } from './use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';
import { UpdateAgreementUseCase } from './use-cases/update-agreement.use-case';
import { GetPaymentAgreementPdfDataUseCase } from './use-cases/get-payment-agreement-pdf-data.use-case';
import { ReportStyleDispatcher } from 'src/reports/application/report-style.dispatcher';
import { projectPaymentAgreementReport } from 'src/reports/application/definitions/payment-agreement-report.definition';

@Injectable()
export class AgreementsService {
  constructor(
    private readonly agreementRepository: AgreementRepository,
    private readonly createUseCase: CreateAgreementUseCase,
    private readonly findOneUseCase: FindOneAgreementUseCase,
    private readonly getDebtSummaryUseCase: GetDebtSummaryUseCase,
    private readonly updateUseCase: UpdateAgreementUseCase,
    private readonly getPdfDataUseCase: GetPaymentAgreementPdfDataUseCase,
    private readonly dispatcher: ReportStyleDispatcher,
  ) {}

  // ── Estado catalogs ──────────────────────────────────────────────────────

  async findAllAgreementStates(): Promise<EnumStateDto[]> {
    return buildStateCatalog(EstadoConvenio, {
      [EstadoConvenio.ACTIVO]: 'Activo',
      [EstadoConvenio.PENDIENTE_ABONO]: 'Pendiente Abono',
      [EstadoConvenio.PREPARADO]: 'Preparado',
      [EstadoConvenio.ANULADO]: 'Anulado',
      [EstadoConvenio.PAGADO]: 'Pagado',
    });
  }

  async findAllInstallmentStates(): Promise<EnumStateDto[]> {
    return buildStateCatalog(EstadoCuotaConvenio, {
      [EstadoCuotaConvenio.PENDIENTE]: 'Pendiente',
      [EstadoCuotaConvenio.PAGADA]: 'Pagada',
    });
  }

  // ── Debt ─────────────────────────────────────────────────────────────────

  async getDebtSummary(contratoId: bigint): Promise<DebtSummaryResponseDto> {
    return this.getDebtSummaryUseCase.execute(contratoId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  async create(dto: CreateAgreementDto): Promise<AgreementEntity> {
    return this.createUseCase.execute(dto);
  }

  async findAll(params: {
    pagination: PaginateOptions;
    contratoId?: string;
    estado?: string;
    search?: string;
  }): Promise<PaginatedResult<AgreementEntity>> {
    return this.agreementRepository.paginate(params.pagination, {
      contratoId: params.contratoId,
      estado: params.estado,
      search: params.search,
    });
  }

  async findOne(id: bigint): Promise<AgreementEntity> {
    return this.findOneUseCase.execute(id);
  }

  async findInstallments(convenioId: string): Promise<InstallmentEntity[]> {
    await this.findOneUseCase.execute(BigInt(convenioId));
    return this.agreementRepository.findInstallmentsByAgreementId(
      BigInt(convenioId),
    );
  }

  async update(id: bigint, dto: { estado: string }): Promise<AgreementEntity> {
    return this.updateUseCase.execute(id, dto.estado);
  }

  async cancel(id: bigint): Promise<AgreementEntity> {
    return this.update(id, { estado: 'ANULADO' });
  }

  // ── PDF ──────────────────────────────────────────────────────────────────

  async generatePdf(
    convenioId: bigint,
  ): Promise<{ buffer: Buffer; filename: string; clienteNombre: string }> {
    const raw = await this.getPdfDataUseCase.execute(convenioId);
    const { document } = projectPaymentAgreementReport(raw);
    const { buffer, filename } = await this.dispatcher.dispatch(
      'payment-agreement',
      document,
    );
    const cliente = raw.convenio.cliente;
    const clienteNombre =
      cliente.razonSocial ||
      `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim() ||
      convenioId.toString();

    return { buffer, filename, clienteNombre };
  }
}
