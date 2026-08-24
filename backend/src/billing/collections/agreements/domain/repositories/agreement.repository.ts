import type { AgreementEntity } from '../entities/agreement.entity';
import type { InstallmentEntity } from '../entities/installment.entity';
import type {
  AgreementFilters,
  CreateAgreementData,
  CreateInstallmentData,
  PrefacturaDeudaRaw,
  PaymentAgreementReportReadModel,
} from '../types/agreement.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

export abstract class AgreementRepository {
  abstract findById(id: bigint): Promise<AgreementEntity | null>;

  abstract findActiveByContractId(
    contratoId: bigint,
  ): Promise<AgreementEntity | null>;

  abstract paginate(
    pagination: PaginateOptions,
    filters?: AgreementFilters,
  ): Promise<PaginatedResult<AgreementEntity>>;

  abstract findInstallmentsByAgreementId(
    convenioId: bigint,
  ): Promise<InstallmentEntity[]>;

  abstract create(
    data: CreateAgreementData,
    cuotas: CreateInstallmentData[],
  ): Promise<AgreementEntity>;

  abstract updateState(
    id: bigint,
    estado: string,
    data?: { fechaAprobacion?: Date; deletedAt?: Date },
  ): Promise<AgreementEntity>;

  abstract markAsPaid(id: bigint): Promise<AgreementEntity>;

  abstract contractExists(contratoId: bigint): Promise<boolean>;

  abstract findActiveInterestRate(): Promise<number | null>;

  abstract findUnpaidPreInvoices(
    contratoId: bigint,
  ): Promise<PrefacturaDeudaRaw[]>;

  abstract getPdfData(
    convenioId: bigint,
  ): Promise<PaymentAgreementReportReadModel | null>;
}
