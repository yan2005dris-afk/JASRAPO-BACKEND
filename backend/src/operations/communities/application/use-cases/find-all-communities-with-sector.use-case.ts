import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';

@Injectable()
export class FindAllCommunitiesWithSectorUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(
    options: {
      page?: number;
      limit?: number;
      sectorId?: number;
    } = {},
  ): Promise<PaginatedResult<CommunityEntity>> {
    const { page = 1, limit = 10, sectorId } = options;
    const { skip, take } = getPagination(page, limit);

    const where: Record<string, unknown> = { deletedAt: null };

    if (sectorId) {
      where.sector = {
        some: { sectorId, deletedAt: null },
      };
    }

    const [data, total] = await Promise.all([
      this.communityRepository.findMany({ where, skip, take }),
      this.communityRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      data,
      meta: {
        total,
        page,
        limit: take,
        ultimaPagina: totalPages,
        paginaActual: page,
        porPagina: take,
        anterior: page > 1 ? page - 1 : null,
        siguiente: page < totalPages ? page + 1 : null,
      },
    };
  }
}
