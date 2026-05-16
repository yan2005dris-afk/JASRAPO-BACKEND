import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { safeContractsSelect } from '../types/IResponseContract';
import { getPagination } from 'src/infrastructure/common/util/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseContract } from '../types/IResponseContract';
import { toContractResponse } from '../types/contractsMapper';

@Injectable()
export class FindAllContractsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    page = 1,
    limit = 10,
    where?: Prisma.ContratosWhereInput,
  ): Promise<PaginatedResult<IResponseContract>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const [contratos, total] = await this.prisma.$transaction([
      this.prisma.contratos.findMany({
        where: { ...where, deletedAt: null },
        select: safeContractsSelect,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contratos.count({
        where: { ...where, deletedAt: null },
      }),
    ]);

    return {
      data: contratos.map(toContractResponse),
      meta: { total, page: safePage, limit: take },
    };
  }
}
