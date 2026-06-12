import type { UserWithRoleResponse } from '../../domain/types/user.types';

export class UserMapper {
  static toWithRole(rawUser: any): UserWithRoleResponse | null {
    if (!rawUser) return null;
    return {
      usuarioId: rawUser.usuarioId,
      email: rawUser.email,
      nombres: rawUser.nombres,
      apellidos: rawUser.apellidos,
      telefono: rawUser.telefono,
      avatar: rawUser.avatar,
      deletedAt: rawUser.deletedAt,
      rol: rawUser.rol
        ? {
            rolId: rawUser.rol.rolId,
            nombre: rawUser.rol.nombre,
            deletedAt: rawUser.rol.deletedAt,
          }
        : null,
    };
  }

  static toWithRoleAndClave(
    rawUser: any,
  ): (UserWithRoleResponse & { clave: string }) | null {
    if (!rawUser) return null;
    const base = this.toWithRole(rawUser);
    if (!base) return null;
    return {
      usuarioId: base.usuarioId,
      email: base.email,
      nombres: base.nombres,
      apellidos: base.apellidos,
      telefono: base.telefono,
      avatar: base.avatar,
      deletedAt: base.deletedAt,
      rol: base.rol,
      clave: rawUser.clave,
    };
  }
}
