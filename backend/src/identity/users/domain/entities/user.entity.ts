import type { RoleEntity } from '../../../roles/domain/entities/role.entity';
import type {
  UserAvatar,
  UserDirectPermission,
  UserRolePermission,
} from '../types/user.types';

export class UserEntity {
  usuarioId: number;
  email: string;
  nombres: string | null;
  apellidos: string | null;
  telefono: string | null;
  avatar: UserAvatar | null;
  rol: RoleEntity | null;
  deletedAt: Date | null;
  permisosDirectos?: UserDirectPermission[];
  permisosRol?: UserRolePermission[];

  constructor(partial?: Partial<UserEntity>) {
    this.usuarioId = partial?.usuarioId ?? 0;
    this.email = partial?.email ?? '';
    this.nombres = partial?.nombres ?? null;
    this.apellidos = partial?.apellidos ?? null;
    this.telefono = partial?.telefono ?? null;
    this.avatar = partial?.avatar ?? null;
    this.rol = partial?.rol ?? null;
    this.deletedAt = partial?.deletedAt ?? null;
    this.permisosDirectos = partial?.permisosDirectos ?? [];
    this.permisosRol = partial?.permisosRol ?? [];
  }

  get nombre(): string | null {
    const full = [this.nombres, this.apellidos].filter(Boolean).join(' ');
    return full || null;
  }

  get nombreCompleto(): string {
    return this.nombre || '';
  }
}
