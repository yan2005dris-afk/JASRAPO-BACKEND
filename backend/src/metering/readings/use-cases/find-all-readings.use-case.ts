import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { safeReadingsSelect } from '../types/IResponseReading';
import { toReadingResponse } from '../types/readingMapper';
import { getPagination } from 'src/infrastructure/common/util/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseReading } from '../types/IResponseReading';

@Injectable()
export class FindAllReadingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    page = 1,
    limit = 10,
    where?: Prisma.LecturasWhereInput,
  ): Promise<PaginatedResult<IResponseReading>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const [readings, total] = await this.prisma.$transaction([
      this.prisma.lecturas.findMany({
        where: { ...where, deletedAt: null },
        select: safeReadingsSelect,
        skip,
        take,
        orderBy: { fecha: 'desc' },
      }),
      this.prisma.lecturas.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return {
      data: readings.map(toReadingResponse),
      meta: { total, page: safePage, limit: take },
    };
  }
}
