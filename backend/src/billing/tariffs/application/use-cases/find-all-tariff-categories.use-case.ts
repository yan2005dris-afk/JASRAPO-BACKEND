import { Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseTariffCategory } from '../../types/IResponseTariffCategory';
import { toTariffCategoryResponse } from '../../types/tariffCategoryMapper';

@Injectable()
export class FindAllTariffCategoriesUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(
    page = 1,
    limit = 10,
    nombre?: string,
  ): Promise<PaginatedResult<IResponseTariffCategory>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const where: any = {
      activo: true,
      deletedAt: null,
    };

    if (nombre) {
      where.nombre = {
        contains: nombre,
        mode: 'insensitive',
      };
    }

    const [tariffs, total] = await Promise.all([
      this.tariffRepository.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.tariffRepository.count({
        where,
      }),
    ]);

    return {
      data: tariffs.map(toTariffCategoryResponse),
      meta: {
        total,
        page: safePage,
        limit: take,
        ultimaPagina: Math.ceil(total / take),
        paginaActual: safePage,
        porPagina: take,
        anterior: safePage > 1 ? safePage - 1 : null,
        siguiente: safePage < Math.ceil(total / take) ? safePage + 1 : null,
      },
    };
  }
}
