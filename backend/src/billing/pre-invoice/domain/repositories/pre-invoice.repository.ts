import type { PreInvoiceRow } from '../types/pre-invoice.types';
import type {
  PreInvoiceFilters,
  UpdatePreInvoiceStateData,
} from '../types/pre-invoice.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

export abstract class PreInvoiceRepository {
  abstract paginate(
    filters: PreInvoiceFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<PreInvoiceRow>>;

  abstract findById(id: number | bigint): Promise<PreInvoiceRow | null>;

  /** Finds pre-invoice IDs for a given batch/lote */
  abstract findIdsByLoteId(loteId: bigint): Promise<{ prefacturaId: bigint }[]>;

  abstract updateState(
    id: number | bigint,
    estado: string,
    estadoEsperado: string,
    data?: UpdatePreInvoiceStateData,
  ): Promise<boolean>;
}
