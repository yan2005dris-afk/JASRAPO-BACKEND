import { Injectable } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { Prisma } from 'src/generated/prisma/client';
import { safeReadingAnomaliesSelect } from '../../types/IResponseReadingAnomaly';
import { toReadingAnomalyResponse } from '../../types/readingAnomalyMapper';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseReadingAnomaly } from '../../types/IResponseReadingAnomaly';

@Injectable()
export class FindAllReadingAnomaliesUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(
    page = 1,
    limit = 10,
    where?: Prisma.LecturaAnomaliaWhereInput,
  ): Promise<PaginatedResult<IResponseReadingAnomaly>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const filterWhere = { ...where, deletedAt: null };

    const [anomalies, total] = await Promise.all([
      this.readingAnomalyRepository.findMany({
        where: filterWhere,
        select: safeReadingAnomaliesSelect,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.readingAnomalyRepository.count({
        where: filterWhere,
      }),
    ]);

    return {
      data: anomalies.map(toReadingAnomalyResponse),
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
