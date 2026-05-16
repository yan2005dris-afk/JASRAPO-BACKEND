import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { safeReadingAnomaliesSelect } from '../types/IResponseReadingAnomaly';
import { toReadingAnomalyResponse } from '../types/readingAnomalyMapper';
import { getPagination } from 'src/infrastructure/common/util/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseReadingAnomaly } from '../types/IResponseReadingAnomaly';

@Injectable()
export class FindAllReadingAnomaliesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    page = 1,
    limit = 10,
    where?: Prisma.LecturaAnomaliaWhereInput,
  ): Promise<PaginatedResult<IResponseReadingAnomaly>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const [anomalies, total] = await this.prisma.$transaction([
      this.prisma.lecturaAnomalia.findMany({
        where: { ...where, deletedAt: null },
        select: safeReadingAnomaliesSelect,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lecturaAnomalia.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return {
      data: anomalies.map(toReadingAnomalyResponse),
      meta: { total, page: safePage, limit: take },
    };
  }
}
