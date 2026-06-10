import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { safeContractsSelect } from '../../types/IResponseContract';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { IResponseContract } from '../../types/IResponseContract';
import { toContractResponse } from '../../types/contractsMapper';

@Injectable()
export class FindAllContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    page = 1,
    limit = 10,
    where?: Prisma.ContratosWhereInput,
  ): Promise<PaginatedResult<IResponseContract>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const filterWhere = { ...where, deletedAt: null };

    const [contratos, total] = await Promise.all([
      this.contractRepository.findMany({
        where: filterWhere,
        select: safeContractsSelect,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.contractRepository.count({
        where: filterWhere,
      }),
    ]);

    return {
      data: contratos.map(toContractResponse),
      meta: {
        total,
        page: safePage,
        limit: take,
        ultimaPagina: Math.ceil(total / take),
        paginaActual: safePage,
        porPagina: take,
        anterior: safePage > 1 ? safePage - 1 : null,
        siguiente: safePage < Math.ceil(total / take) ? safePage + 1 : null,
      },
    };
  }
}
