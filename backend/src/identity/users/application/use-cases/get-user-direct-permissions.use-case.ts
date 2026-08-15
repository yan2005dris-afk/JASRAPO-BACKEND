import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserDirectPermission } from '../../domain/types/user.types';

@Injectable()
export class GetUserDirectPermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number): Promise<UserDirectPermission[]> {
    const user = await this.userRepository.findById(usuarioId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    const assignments =
      await this.userRepository.findDirectPermissions(usuarioId);

    return assignments.map((assignment) => ({
      usuarioPermisoId: assignment.usuarioPermisoId,
      permisoId: assignment.permisoId,
      recurso: assignment.permiso.recurso,
      accion: assignment.permiso.accion,
      permitido: assignment.permitido,
    }));
  }
}
