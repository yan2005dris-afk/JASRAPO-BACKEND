import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import type { UserDetailData } from '../../domain/types/user.types';

@Injectable()
export class GetUserDetailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(criteria: {
    usuarioId?: number;
    email?: string;
  }): Promise<UserDetailData | null> {
    const user = criteria.usuarioId
      ? await this.userRepository.findById(criteria.usuarioId)
      : criteria.email
        ? await this.userRepository.findByEmail(criteria.email)
        : null;

    if (!user || user.deletedAt) return null;

    const [directPermissionRows, rolePermissionRows] = await Promise.all([
      this.userRepository.findDirectPermissions(user.usuarioId),
      user.rol && !user.rol.deletedAt
        ? this.userRepository.findRolePermissions(user.rol.rolId)
        : Promise.resolve([]),
    ]);

    const permisosDirectos = directPermissionRows.map((a) => ({
      usuarioPermisoId: a.usuarioPermisoId,
      permisoId: a.permisoId,
      recurso: a.recurso,
      accion: a.accion,
      permitido: a.permitido,
    }));

    const permisosRol = rolePermissionRows.map((rp) => ({
      recurso: rp.recurso,
      accion: rp.accion,
    }));

    return {
      ...user,
      permisosDirectos,
      permisosRol,
    };
  }
}
