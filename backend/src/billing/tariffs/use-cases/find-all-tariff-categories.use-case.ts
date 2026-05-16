import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeTariffCategoriesSelect } from '../types/IResponseTariffCategory';
import { toTariffCategoryResponse } from '../types/tariffCategoryMapper';
import { getPagination } from 'src/infrastructure/common/util/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseTariffCategory } from '../types/IResponseTariffCategory';

@Injectable()
export class FindAllTariffCategoriesUseCase {
  constructor(private readonly prisma: PrismaService) {}

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

    const [tariffs, total] = await this.prisma.$transaction([
      this.prisma.categoriaTarifa.findMany({
        where,
        select: safeTariffCategoriesSelect,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.categoriaTarifa.count({
        where,
      }),
    ]);

    return {
      data: tariffs.map(toTariffCategoryResponse),
      meta: { total, page: safePage, limit: take },
    };
  }
}
