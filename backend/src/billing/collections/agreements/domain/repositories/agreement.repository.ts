import type { AgreementRow, CuotaConvenioRow } from '../types/agreement.types';
import type {
  AgreementFilters,
  CreateAgreementData,
  CreateInstallmentData,
  PrefacturaDeudaRaw,
  PaymentAgreementReportReadModel,
} from '../types/agreement.types';
import type { PaginateOptions } from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';

export abstract class AgreementRepository {
  abstract findById(id: bigint): Promise<AgreementRow | null>;

  abstract findActiveByContractId(
    contratoId: bigint,
  ): Promise<AgreementRow | null>;

  abstract paginate(
    pagination: PaginateOptions,
    filters?: AgreementFilters,
  ): Promise<PaginatedResult<AgreementRow>>;

  abstract findInstallmentsByAgreementId(
    convenioId: bigint,
  ): Promise<CuotaConvenioRow[]>;

  abstract create(
    data: CreateAgreementData,
    cuotas: CreateInstallmentData[],
  ): Promise<AgreementRow>;

  abstract updateState(
    id: bigint,
    estado: string,
    data?: { fechaAprobacion?: Date; deletedAt?: Date },
  ): Promise<AgreementRow>;

  abstract markAsPaid(id: bigint): Promise<AgreementRow>;

  abstract contractExists(contratoId: bigint): Promise<boolean>;

  abstract findActiveInterestRate(): Promise<number | null>;

  abstract findUnpaidPreInvoices(
    contratoId: bigint,
  ): Promise<PrefacturaDeudaRaw[]>;

  abstract getPdfData(
    convenioId: bigint,
  ): Promise<PaymentAgreementReportReadModel | null>;
}
