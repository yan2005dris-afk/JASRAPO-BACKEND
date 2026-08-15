import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class AssignPermissionToRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(rolId: number, permisoId: number) {
    const role = await this.roleRepository.findUnique(rolId);
    if (!role || role.deletedAt)
      throw new EntityNotFoundException('Rol', rolId);

    const permission = await this.roleRepository.findPermission(permisoId);
    if (!permission || permission.deletedAt)
      throw new EntityNotFoundException('Permiso', permisoId);

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
      throw new EntityAlreadyExistsException(
        'Asignación Rol-Permiso',
        'permisoId',
        String(permisoId),
      );
    }

    return this.roleRepository.assignPermission(rolId, permisoId);
  }
}
