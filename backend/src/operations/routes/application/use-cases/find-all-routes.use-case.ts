import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(params: {
    pagination: PaginateOptions;
    where?: Record<string, any>;
  }): Promise<PaginatedResult<RouteEntity>> {
    const { pagination, where } = params;

    return this.routeRepository.paginateRutas(
      {
        where: { ...where, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );
  }
}
