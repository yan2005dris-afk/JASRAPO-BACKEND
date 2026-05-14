import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { RouteEntity } from '../types/route.entity';
import { RouteMapper } from '../types/mappers';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/util/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    pagination: PaginateOptions;
    where?: Prisma.RutasWhereInput;
  }): Promise<PaginatedResult<RouteEntity>> {
    const { pagination, where } = params;

    const result = await paginate<any>(
      this.prisma.rutas,
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
