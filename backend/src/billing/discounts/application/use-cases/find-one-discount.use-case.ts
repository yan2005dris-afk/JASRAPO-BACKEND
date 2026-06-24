import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';

@Injectable()
export class FindOneDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(id: number) {
    const discount = await this.discountRepository.findUniqueCatalogo({ id });
    if (!discount) {
      throw new NotFoundException(`Descuento con ID ${id} no encontrado`);
    }
    return discount;
  }
}
