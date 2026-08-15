import { Injectable } from '@nestjs/common';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import type { PreInvoiceEntity } from '../../domain/entities/pre-invoice.entity';

@Injectable()
export class FindOnePreInvoiceUseCase {
  constructor(private readonly preInvoiceRepository: PreInvoiceRepository) {}

  async execute(id: number): Promise<PreInvoiceEntity> {
    const preInvoice = await this.preInvoiceRepository.findById(id);

    if (!preInvoice) {
      throw new EntityNotFoundException('Prefactura', id);
    }

    return preInvoice;
  }
}
