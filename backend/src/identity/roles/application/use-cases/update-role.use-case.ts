import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { UpdateRoleDto } from '../../interfaces/dto/update-role.dto';
import { AssignPermissionToRoleUseCase } from './assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './remove-permission-from-role.use-case';
import { FindOneRoleUseCase } from './find-one-role.use-case';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly findOneRoleUseCase: FindOneRoleUseCase,
    private readonly assignPermissionUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionUseCase: RemovePermissionFromRoleUseCase,
  ) {}

  async execute(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findUnique(id);
    if (!role || role.deletedAt) {
      throw new EntityNotFoundException('Rol', id);
    }

    if (updateRoleDto.nombre !== undefined) {
      await this.roleRepository.update(id, { nombre: updateRoleDto.nombre });
    }

    if (
      updateRoleDto.permisosAsignar &&
      updateRoleDto.permisosAsignar.length > 0
    ) {
      for (const permisoId of updateRoleDto.permisosAsignar) {
        try {
          await this.assignPermissionUseCase.execute(id, permisoId);
        } catch {
          // Ignorar si ya está asignado
        }
      }
    }

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

    return this.findOneRoleUseCase.execute(id);
  }
}
