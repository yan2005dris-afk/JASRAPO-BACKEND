import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import type { DiscountEntity } from '../../domain/entities/discount.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(id: number): Promise<DiscountEntity> {
    const discount = await this.discountRepository.findUniqueCatalogo(id);
    if (!discount) {
      throw new EntityNotFoundException('CatalogoDescuento', id);
    }
    return discount;
  }
}
