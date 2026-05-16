import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeSectoresSelect } from '../types/IResponseSector';
import { getPagination } from 'src/infrastructure/common/util/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseSector } from '../types/IResponseSector';

@Injectable()
export class GetAllSectorsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(page = 1, limit = 10): Promise<PaginatedResult<IResponseSector>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const [sectores, total] = await this.prisma.$transaction([
      this.prisma.sectores.findMany({
        where: { deletedAt: null },
        select: safeSectoresSelect,
        skip,
        take,
        orderBy: { sectorId: 'asc' },
      }),
      this.prisma.sectores.count({
        where: { deletedAt: null },
      }),
    ]);

    return {
      data: sectores as IResponseSector[],
      meta: { total, page: safePage, limit: take },
    };
  }
}
