import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import type { DiscountFilterDto } from '../../interfaces/dto/discount-filter.dto';
import type { DiscountEntity } from '../../domain/entities/discount.entity';
import type { DiscountFilters } from '../../domain/types/discount.types';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@Injectable()
export class FindAllDiscountsUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(
    filter: DiscountFilterDto,
  ): Promise<PaginatedResult<DiscountEntity>> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: DiscountFilters = { activo: true };

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

    const lastPage = Math.ceil(total / limit);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        ultimaPagina: lastPage,
        paginaActual: page,
        porPagina: limit,
        anterior: page > 1 ? page - 1 : null,
        siguiente: page < lastPage ? page + 1 : null,
      },
    };
  }
}
