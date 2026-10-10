import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import type { RoleRow } from '../../domain/types/role.types';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import { getPagination } from 'src/shared/pagination/pagination.util';

@Injectable()
export class FindAllRolesUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<RoleRow>> {
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
