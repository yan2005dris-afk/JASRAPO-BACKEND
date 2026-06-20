import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { PREINVOICE_STATES } from './pre-invoice-states';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { FindAllPreInvoicesUseCase } from './use-cases/find-all-pre-invoices.use-case';
import { FindOnePreInvoiceUseCase } from './use-cases/find-one-pre-invoice.use-case';
import { UpdatePreInvoiceStateUseCase } from './use-cases/update-pre-invoice-state.use-case';

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
    filters?: {
      loteId?: number;
      periodoId?: number;
      estado?: string;
      contratoId?: string;
      identificacion?: string;
    },
  ): Promise<PaginatedResult<any>> {
    return this.findAllUseCase.execute(page, limit, filters);
  }

  async findOne(id: number) {
    return this.findOneUseCase.execute(id);
  }

  async updateState(
    id: number,
    accion: string,
    userId?: string,
    motivoRechazo?: string,
  ) {
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
