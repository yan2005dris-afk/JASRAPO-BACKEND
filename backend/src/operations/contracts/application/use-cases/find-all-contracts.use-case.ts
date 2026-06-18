import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { ContractEntity } from '../../domain/entities/contract.entity';

@Injectable()
export class FindAllContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    page = 1,
    limit = 10,
    where?: Record<string, any>,
  ): Promise<PaginatedResult<ContractEntity>> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const filterWhere = { ...where, deletedAt: null };

    const [contratos, total] = await Promise.all([
      this.contractRepository.findMany({
        where: filterWhere,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.contractRepository.count({
        where: filterWhere,
      }),
    ]);

    return {
      data: contratos,
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
