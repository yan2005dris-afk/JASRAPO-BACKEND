import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

export interface SessionCapability {
  resource: string;
  action: string;
}

@Injectable()
export class GetEffectivePermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number): Promise<{ recurso: string; accion: string }[]> {
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

    const permissions = Array.from(effectivePermissionsMap.keys()).map((key) => {
      const [recurso, accion] = key.split(':');
      return { recurso, accion };
    });

    return permissions.sort((a, b) => {
      const cmp = a.recurso.localeCompare(b.recurso);
      return cmp !== 0 ? cmp : a.accion.localeCompare(b.accion);
    });
  }

  async getCapabilities(usuarioId: number): Promise<SessionCapability[]> {
    const permissions = await this.execute(usuarioId);
    return this.mapToCapabilities(permissions);
  }

  mapToCapabilities(
    permissions: Array<{ recurso: string; accion: string }>,
  ): SessionCapability[] {
    const map = new Map<string, SessionCapability>();

    for (const p of permissions) {
      const resource = p.recurso?.trim();
      const action = p.accion?.trim();
      if (resource && action) {
        const key = `${resource}:${action}`;
        if (!map.has(key)) {
          map.set(key, { resource, action });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const cmp = a.resource.localeCompare(b.resource);
      return cmp !== 0 ? cmp : a.action.localeCompare(b.action);
    });
  }
}
