import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { Prisma } from 'src/generated/prisma/client';
import { safeReadingsSelect } from '../../types/IResponseReading';
import { toReadingResponse } from '../../types/readingMapper';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseReading } from '../../types/IResponseReading';

@Injectable()
export class FindAllReadingsUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(
    page = 1,
    limit = 10,
    where?: Prisma.LecturasWhereInput,
  ): Promise<PaginatedResult<IResponseReading>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const filterWhere = { ...where, deletedAt: null };

    const [readings, total] = await Promise.all([
      this.readingRepository.findMany({
        where: filterWhere,
        select: safeReadingsSelect,
        skip,
        take,
        orderBy: { fecha: 'desc' },
      }),
      this.readingRepository.count({
        where: filterWhere,
      }),
    ]);

    return {
      data: readings.map(toReadingResponse),
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
