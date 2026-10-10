import { Injectable } from '@nestjs/common';
import {
  ReadingFilters,
  ReadingRepository,
} from '../../domain/repositories/reading.repository';
import { getPagination } from 'src/shared/pagination/pagination.util';
import { PaginatedResult } from 'src/shared/pagination/pagination.types';
import { LecturaEntity } from '../../domain/entities/lectura.entity';

@Injectable()
export class FindAllReadingsUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(
    page = 1,
    limit = 10,
    filters?: ReadingFilters,
  ): Promise<PaginatedResult<LecturaEntity>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const [readings, total] = await Promise.all([
      this.readingRepository.findMany({
        where: filters,
        skip,
        take,
      }),
      this.readingRepository.count({
        where: filters,
      }),
    ]);

    return {
      data: readings,
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
