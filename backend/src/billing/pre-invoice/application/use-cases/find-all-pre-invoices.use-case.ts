import { Injectable, BadRequestException } from '@nestjs/common';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type {
  PreInvoiceRow,
  PreInvoiceFilters,
} from '../../domain/types/pre-invoice.types';

@Injectable()
export class FindAllPreInvoicesUseCase {
  constructor(private readonly preInvoiceRepository: PreInvoiceRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    filters?: PreInvoiceFilters,
  ): Promise<PaginatedResult<PreInvoiceRow>> {
    if (filters?.contratoId && !/^\d+$/.test(filters.contratoId)) {
      throw new BadRequestException('contratoId must be a numeric value');
    }

    return this.preInvoiceRepository.paginate(filters ?? {}, { page, limit });
  }
}
