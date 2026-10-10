import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import { PREINVOICE_STATES } from '../domain/constants/pre-invoice-states';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { FindAllPreInvoicesUseCase } from './use-cases/find-all-pre-invoices.use-case';
import { FindOnePreInvoiceUseCase } from './use-cases/find-one-pre-invoice.use-case';
import { UpdatePreInvoiceStateUseCase } from './use-cases/update-pre-invoice-state.use-case';
import type { PreInvoiceRow } from '../domain/types/pre-invoice.types';
import type { PreInvoiceFilters } from '../domain/types/pre-invoice.types';

@Injectable()
export class PreInvoiceService {
  constructor(
    private readonly findAllUseCase: FindAllPreInvoicesUseCase,
    private readonly findOneUseCase: FindOnePreInvoiceUseCase,
    private readonly updateStateUseCase: UpdatePreInvoiceStateUseCase,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: PreInvoiceFilters,
  ): Promise<PaginatedResult<PreInvoiceRow>> {
    return this.findAllUseCase.execute(page, limit, filters);
  }

  async findOne(id: number): Promise<PreInvoiceRow> {
    return this.findOneUseCase.execute(id);
  }

  async updateState(
    id: number,
    accion: string,
    userId?: string,
    motivoRechazo?: string,
  ): Promise<PreInvoiceRow> {
    return this.updateStateUseCase.execute({
      id,
      accion,
      userId,
      motivoRechazo,
    });
  }

  async findAllStates(): Promise<EnumStateDto[]> {
    return PREINVOICE_STATES;
  }
}
