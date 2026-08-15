import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class FindOneRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: number) {
    const role = await this.roleRepository.findUnique(id);

    if (!role || role.deletedAt) {
      throw new NotFoundException('Rol no encontrado');
    }

    return {
      rolId: role.rolId,
      nombre: role.nombre,
      permisos: (role.rolPermisos || []).map((rp: any) => ({
        rolPermisoId: rp.rolPermisoId,
        permisoId: rp.permisoId,
        nombre: rp.permiso?.nombre,
        descripcion: rp.permiso?.descripcion,
        recurso: rp.permiso?.recurso,
        accion: rp.permiso?.accion,
      })),
    };
  }
}
