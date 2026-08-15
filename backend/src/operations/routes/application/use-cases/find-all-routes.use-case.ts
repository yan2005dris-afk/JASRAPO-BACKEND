import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import type { RouteFilters } from '../../domain/types/route.types';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(params: {
    pagination: { page?: number; limit?: number };
    where?: RouteFilters;
  }): Promise<PaginatedResult<RouteEntity>> {
    const { pagination, where } = params;
    const { skip, take, page } = getPagination(
      pagination.page ?? 1,
      pagination.limit ?? 10,
    );

    return this.routeRepository.paginateRutas(where ?? {}, {
      skip,
      take,
      page,
    });
  }
}
