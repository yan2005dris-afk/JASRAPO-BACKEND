import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import type { CommunityRow } from '../../domain/types/community.types';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import type { CommunityFilterDto } from '../../interfaces/dto/community-filter.dto';

@Injectable()
export class FindAllCommunitiesUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    filters?: CommunityFilterDto,
  ): Promise<PaginatedResult<CommunityRow>> {
    const { skip, take } = getPagination(page, limit);

    const { data, total } = await this.communityRepository.paginate(
      {
        nombre: filters?.nombre,
        codigo: filters?.codigo,
      },
      { skip, take },
    );

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
