import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseSector, safeSectoresSelect } from '../../types/IResponseSector';

@Injectable()
export class GetAllSectorsUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(page = 1, limit = 10): Promise<PaginatedResult<IResponseSector>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const where = { deletedAt: null };

    const [sectores, total] = await Promise.all([
      this.sectorRepository.findMany({
        where,
        select: safeSectoresSelect,
        skip,
        take,
        orderBy: { sectorId: 'asc' },
      } as any),
      this.sectorRepository.count({
        where,
      }),
    ]);

    return {
      data: sectores as IResponseSector[],
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
