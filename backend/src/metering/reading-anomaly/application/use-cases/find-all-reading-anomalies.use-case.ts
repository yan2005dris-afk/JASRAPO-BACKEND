import { Injectable } from '@nestjs/common';
import {
  ReadingAnomalyFilters,
  ReadingAnomalyRepository,
} from '../../domain/repositories/reading-anomaly.repository';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';

@Injectable()
export class FindAllReadingAnomaliesUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(
    page = 1,
    limit = 10,
    filters?: ReadingAnomalyFilters,
  ): Promise<PaginatedResult<ReadingAnomalyEntity>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const [anomalies, total] = await Promise.all([
      this.readingAnomalyRepository.findMany({
        where: filters,
        skip,
        take,
      }),
      this.readingAnomalyRepository.count({
        where: filters,
      }),
    ]);

    return {
      data: anomalies,
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
