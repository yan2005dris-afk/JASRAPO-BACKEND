import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserDetailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(criteria: {
    usuarioId?: number;
    email?: string;
  }): Promise<UserEntity | null> {
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

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      avatar: user.avatar,
      rol:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
      permisosDirectos: directPermissionRows.map((a) => ({
        usuarioPermisoId: a.usuarioPermisoId,
        permisoId: a.permisoId,
        recurso: a.permiso.recurso,
        accion: a.permiso.accion,
        permitido: a.permitido,
      })),
      permisosRol: rolePermissionRows.map((rp) => ({
        recurso: rp.permiso.recurso,
        accion: rp.permiso.accion,
      })),
    } as any;
  }
}
