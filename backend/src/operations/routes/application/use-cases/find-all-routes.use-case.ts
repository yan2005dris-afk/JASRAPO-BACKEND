import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/types/route.entity';
import { RouteMapper } from '../../domain/types/mappers';
import { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(params: {
    pagination: PaginateOptions;
    where?: Prisma.RutasWhereInput;
  }): Promise<PaginatedResult<RouteEntity>> {
    const { pagination, where } = params;

    const result = await this.routeRepository.paginateRutas(
      {
        where: { ...where, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );

    return {
      ...result,
      data: result.data.map((r: any) => RouteMapper.toEntity(r)),
    };
  }
}
