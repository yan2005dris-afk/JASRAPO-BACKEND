import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import type { DiscountRow } from '../../domain/types/discount.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(id: number): Promise<DiscountRow> {
    const discount = await this.discountRepository.findUniqueCatalogo(id);
    if (!discount) {
      throw new EntityNotFoundException('CatalogoDescuento', id);
    }
    return discount;
  }
}
