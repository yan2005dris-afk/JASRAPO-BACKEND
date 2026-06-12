import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { PermissionEntity } from '../../domain/repositories/permission.repository';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';

@Injectable()
export class FindAllPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<PermissionEntity>> {
    const { skip, take } = getPagination(page, limit);

    const [data, total] = await Promise.all([
      this.permissionRepository.findAll(skip, take),
      this.permissionRepository.count({ where: { deletedAt: null } }),
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
