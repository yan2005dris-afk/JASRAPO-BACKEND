import { Injectable } from '@nestjs/common';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import type { PreInvoiceRow } from '../../domain/types/pre-invoice.types';

@Injectable()
export class FindOnePreInvoiceUseCase {
  constructor(private readonly preInvoiceRepository: PreInvoiceRepository) {}

  async execute(id: number): Promise<PreInvoiceRow> {
    const preInvoice = await this.preInvoiceRepository.findById(id);

    if (!preInvoice) {
      throw new EntityNotFoundException('Prefactura', id);
    }

    return preInvoice;
  }
}
