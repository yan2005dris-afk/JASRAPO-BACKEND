import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { SectorRow } from '../../infrastructure/repositories/sector.include';
import type { SectorFilters } from '../../domain/types/sector.types';

@Injectable()
export class GetAllSectorsUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(
    page = 1,
    limit = 10,
    filters?: SectorFilters,
  ): Promise<PaginatedResult<SectorRow>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const { data: sectores, total } = await this.sectorRepository.paginate(
      filters ?? {},
      { skip, take },
    );

    const totalPages = Math.ceil(total / take);

    return {
      data: sectores,
      meta: {
        total,
        page: safePage,
        limit: take,
        ultimaPagina: totalPages,
        paginaActual: safePage,
        porPagina: take,
        anterior: safePage > 1 ? safePage - 1 : null,
        siguiente: safePage < totalPages ? safePage + 1 : null,
      },
    };
  }
}
