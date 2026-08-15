import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRolePermission } from '../../domain/types/user.types';

@Injectable()
export class GetUserRolePermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number): Promise<UserRolePermission[]> {
    const user = await this.userRepository.findById(usuarioId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    if (!user.rol?.rolId) {
      return [];
    }

    const assignments = await this.userRepository.findRolePermissions(
      user.rol.rolId,
    );

    return assignments.map((rp) => ({
      recurso: rp.permiso.recurso,
      accion: rp.permiso.accion,
    }));
  }
}
