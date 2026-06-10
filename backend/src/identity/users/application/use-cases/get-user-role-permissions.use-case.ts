import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface UserRolePermission {
  recurso: string;
  accion: string;
}

@Injectable()
export class GetUserRolePermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number): Promise<UserRolePermission[]> {
    const user = await this.userRepository.findUnique(
      { usuarioId },
      { usuarioId: true, deletedAt: true, rolId: true },
    );

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    if (!user.rolId) {
      return [];
    }

    const assignments = await this.userRepository.findRolePermissions(
      user.rolId,
    );

    return assignments.map((rp) => ({
      recurso: rp.permiso.recurso,
      accion: rp.permiso.accion,
    }));
  }
}
