import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class RemovePermissionFromRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(rolId: number, permisoId: number) {
    const assignment = await this.roleRepository.findFirstAssignment(rolId, permisoId);

    if (!assignment) {
      throw new NotFoundException('Permiso no asignado a este rol');
    }

    return this.roleRepository.updateAssignment(assignment.rolPermisoId, {
      deletedAt: new Date(),
    });
  }
}
