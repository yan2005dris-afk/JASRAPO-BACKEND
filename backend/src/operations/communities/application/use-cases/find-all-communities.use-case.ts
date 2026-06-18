import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import type { CommunityFilterDto } from '../../interfaces/dto/community-filter.dto';

@Injectable()
export class FindAllCommunitiesUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    filters?: CommunityFilterDto,
  ): Promise<PaginatedResult<CommunityEntity>> {
    const { skip, take } = getPagination(page, limit);

    const where: Record<string, any> = { deletedAt: null };
    if (filters?.nombre) {
      where.nombre = { contains: filters.nombre, mode: 'insensitive' };
    }
    if (filters?.codigo) {
      where.codigo = { contains: filters.codigo, mode: 'insensitive' };
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
