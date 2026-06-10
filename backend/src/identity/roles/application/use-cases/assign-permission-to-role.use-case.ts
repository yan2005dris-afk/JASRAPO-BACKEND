import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class AssignPermissionToRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(rolId: number, permisoId: number) {
    const role = await this.roleRepository.findUnique(rolId);
    if (!role || role.deletedAt)
      throw new NotFoundException('Rol no encontrado o eliminado');

    const permission = await this.roleRepository.findPermission(permisoId);
    if (!permission || permission.deletedAt)
      throw new NotFoundException('Permiso no encontrado o eliminado');

    const existing = await this.roleRepository.findFirstAssignment(
      rolId,
      permisoId,
    );

    if (existing) {
      if (existing.deletedAt) {
        return this.roleRepository.updateAssignment(existing.rolPermisoId, {
          deletedAt: null,
        });
      }
      throw new ConflictException('El rol ya tiene ese permiso asignado');
    }

    return this.roleRepository.assignPermission(rolId, permisoId);
  }
}
