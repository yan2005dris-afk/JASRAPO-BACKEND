import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class GetEffectivePermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number) {
    const usuario = await this.userRepository.findById(usuarioId);

    if (!usuario || usuario.deletedAt) {
      throw new EntityNotFoundException('Usuario', usuarioId);
    }

    const rolId = usuario.rol?.rolId;

    const [rolePermissionRows, directPermissionRows] = await Promise.all([
      rolId
        ? this.userRepository.findRolePermissions(rolId)
        : Promise.resolve([]),
      this.userRepository.findDirectPermissions(usuarioId),
    ]);

    const effectivePermissionsMap = new Map<string, boolean>();

    rolePermissionRows.forEach((rp) => {
      effectivePermissionsMap.set(`${rp.recurso}:${rp.accion}`, true);
    });

    directPermissionRows.forEach((up) => {
      const key = `${up.recurso}:${up.accion}`;
      if (up.permitido) {
        effectivePermissionsMap.set(key, true);
      } else {
        effectivePermissionsMap.delete(key);
      }
    });

    return Array.from(effectivePermissionsMap.keys()).map((key) => {
      const [recurso, accion] = key.split(':');
      return { recurso, accion };
    });
  }
}
