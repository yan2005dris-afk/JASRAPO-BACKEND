import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class GetRolePermissionsUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(rolId: number) {
    const role = await this.roleRepository.findUnique(rolId);
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado o eliminado');
    }

    const assignments = role.rolPermisos || [];

    return assignments.map((assignment: any) => ({
      rolPermisoId: assignment.rolPermisoId,
      permisoId: assignment.permisoId,
      recurso: assignment.permiso.recurso,
      accion: assignment.permiso.accion,
    }));
  }
}
