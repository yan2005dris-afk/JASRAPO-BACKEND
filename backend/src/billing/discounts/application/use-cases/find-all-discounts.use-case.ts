import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { DiscountFilterDto } from '../../interfaces/dto/discount-filter.dto';

@Injectable()
export class FindAllDiscountsUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(filter: DiscountFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { activo: true };

    if (filter.tipoDescuento) {
      where.tipoDescuento = filter.tipoDescuento;
    }
    if (filter.aplicaAutomatico !== undefined) {
      where.aplicaAutomatico = filter.aplicaAutomatico === 'true';
    }

    const [items, total] = await Promise.all([
      this.discountRepository.findManyCatalogo({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.discountRepository.countCatalogo({ where }),
    ]);

    return { items, total, page, limit };
  }
}
