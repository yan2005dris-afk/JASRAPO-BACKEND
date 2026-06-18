import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from '../interfaces/dto/create-role.dto';
import { UpdateRoleDto } from '../interfaces/dto/update-role.dto';
import { CreateRoleUseCase } from './use-cases/create-role.use-case';
import { AssignPermissionToRoleUseCase } from './use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './use-cases/remove-permission-from-role.use-case';
import {
  RoleRepository,
  type SimpleRole,
} from '../domain/repositories/role.repository';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';

@Injectable()
export class RolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly assignPermissionUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionUseCase: RemovePermissionFromRoleUseCase,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<SimpleRole>> {
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

  async findOne(id: number) {
    const role = await this.roleRepository.findUnique(id);

    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado');
    }

    return {
      rolId: role.rolId,
      nombre: role.nombre,
      permisos: role.rolPermisos.map((rp: any) => ({
        rolPermisoId: rp.rolPermisoId,
        permisoId: rp.permisoId,
        nombre: rp.permiso.nombre,
        descripcion: rp.permiso.descripcion,
        recurso: rp.permiso.recurso,
        accion: rp.permiso.accion,
      })),
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findUnique(id);
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Actualizar nombre si viene
    if (updateRoleDto.nombre !== undefined) {
      await this.roleRepository.update(id, { nombre: updateRoleDto.nombre });
    }

    // Asignar permisos
    if (
      updateRoleDto.permisosAsignar &&
      updateRoleDto.permisosAsignar.length > 0
    ) {
      for (const permisoId of updateRoleDto.permisosAsignar) {
        try {
          await this.assignPermissionUseCase.execute(id, permisoId);
        } catch {
          // Ignorar conflictos (ya asignado)
        }
      }
    }

    // Revocar permisos
    if (
      updateRoleDto.permisosRevocar &&
      updateRoleDto.permisosRevocar.length > 0
    ) {
      for (const permisoId of updateRoleDto.permisosRevocar) {
        try {
          await this.removePermissionUseCase.execute(id, permisoId);
        } catch {
          // Ignorar si no estaba asignado
        }
      }
    }

    // Retornar rol actualizado con permisos
    return this.findOne(id);
  }
}
