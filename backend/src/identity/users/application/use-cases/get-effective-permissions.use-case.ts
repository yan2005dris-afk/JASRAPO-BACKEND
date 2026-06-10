import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class GetEffectivePermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number) {
    const usuario = await this.userRepository.findUnique(
      { usuarioId },
      { usuarioId: true, deletedAt: true, rolId: true },
    );

    if (!usuario || usuario.deletedAt) {
      throw new NotFoundException('Usuario eliminado o no encontrado');
    }

    const rolId = usuario.rolId;

    const [rolePermissionRows, directPermissionRows] = await Promise.all([
      rolId ? this.userRepository.findRolePermissions(rolId) : Promise.resolve([]),
      this.userRepository.findDirectPermissions(usuarioId),
    ]);

    const effectivePermissionsMap = new Map<string, boolean>();

    rolePermissionRows.forEach((rp) => {
      effectivePermissionsMap.set(
        `${rp.permiso.recurso}:${rp.permiso.accion}`,
        true,
      );
    });

    directPermissionRows.forEach((up) => {
      if (up.permiso) {
        const key = `${up.permiso.recurso}:${up.permiso.accion}`;
        if (up.permitido) {
          effectivePermissionsMap.set(key, true);
        } else {
          effectivePermissionsMap.delete(key);
        }
      }
    });

    return Array.from(effectivePermissionsMap.keys()).map((key) => {
      const [recurso, accion] = key.split(':');
      return { recurso, accion };
    });
  }
}
