import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { SectorEntity } from '../../domain/entities/sector.entity';
import { SectorFilters } from '../../domain/types/sector-filters';

@Injectable()
export class GetAllSectorsUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(page = 1, limit = 10): Promise<PaginatedResult<SectorEntity>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const where: SectorFilters = { deletedAt: null };

    const [sectores, total] = await Promise.all([
      this.sectorRepository.findMany({
        where,
        skip,
        take,
        orderBy: { sectorId: 'asc' },
      }),
      this.sectorRepository.count({
        where,
      }),
    ]);

    return {
      data: sectores,
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
