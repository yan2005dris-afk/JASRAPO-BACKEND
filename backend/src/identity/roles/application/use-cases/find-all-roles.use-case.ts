import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { RoleEntity } from '../../domain/entities/role.entity';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';

@Injectable()
export class FindAllRolesUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<RoleEntity>> {
    const { skip, take } = getPagination(page, limit);

    const [data, total] = await Promise.all([
      this.roleRepository.findAll(skip, take),
      this.roleRepository.count({ where: { deletedAt: null } }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      data,
      meta: {
        total,
        page,
        limit: take,
        ultimaPagina: totalPages,
        paginaActual: page,
        porPagina: take,
        anterior: page > 1 ? page - 1 : null,
        siguiente: page < totalPages ? page + 1 : null,
      },
    };
  }
}
