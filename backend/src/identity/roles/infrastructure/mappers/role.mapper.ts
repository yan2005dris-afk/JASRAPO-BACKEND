import type { RolePermission } from '../../domain/entities/role.entity';
import { RoleEntity } from '../../domain/entities/role.entity';

export class RoleMapper {
  static toSimple(
    raw: any,
  ): { rolId: number; nombre: string; deletedAt?: Date | null } | null {
    if (!raw) return null;
    return {
      rolId: raw.rolId,
      nombre: raw.nombre,
      deletedAt: raw.deletedAt ?? null,
    };
  }

  static toEntity(raw: any): RoleEntity | null {
    if (!raw) return null;
    return new RoleEntity({
      rolId: raw.rolId,
      nombre: raw.nombre,
      deletedAt: raw.deletedAt ?? null,
      rolPermisos: (raw.rolPermisos || []).map((rp: any) => ({
        rolPermisoId: rp.rolPermisoId,
        rolId: rp.rolId,
        permisoId: rp.permisoId,
        deletedAt: rp.deletedAt ?? null,
        permiso: rp.permiso
          ? {
              permisoId: rp.permiso.permisoId,
              nombre: rp.permiso.nombre,
              descripcion: rp.permiso.descripcion,
              recurso: rp.permiso.recurso,
              accion: rp.permiso.accion,
            }
          : undefined,
      })),
    });
  }

  static toWithPermissions(raw: any): RoleEntity | null {
    return this.toEntity(raw);
  }

  static toRole(raw: any): RoleEntity | null {
    return this.toEntity(raw);
  }

  static toAssignment(raw: any): RolePermission | null {
    if (!raw) return null;
    return {
      rolPermisoId: raw.rolPermisoId,
      rolId: raw.rolId,
      permisoId: raw.permisoId,
      deletedAt: raw.deletedAt ?? null,
    };
  }
}
