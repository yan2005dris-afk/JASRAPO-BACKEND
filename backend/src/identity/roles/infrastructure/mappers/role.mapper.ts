import type {
  SimpleRoleEntity,
  RoleEntity,
  RolePermissionAssignmentEntity,
  RoleWithPermissionsEntity,
} from '../../domain/entities/role.entity';

export class RoleMapper {
  static toSimple(raw: any): SimpleRoleEntity | null {
    if (!raw) return null;
    return {
      rolId: raw.rolId,
      nombre: raw.nombre,
    };
  }

  static toRole(raw: any): RoleEntity | null {
    if (!raw) return null;
    const base = this.toSimple(raw);
    if (!base) return null;
    return {
      ...base,
      deletedAt: raw.deletedAt,
    };
  }

  static toWithPermissions(raw: any): RoleWithPermissionsEntity | null {
    if (!raw) return null;
    const base = this.toRole(raw);
    if (!base) return null;
    return {
      ...base,
      rolPermisos: (raw.rolPermisos || []).map((rp: any) => ({
        rolPermisoId: rp.rolPermisoId,
        rolId: rp.rolId,
        permisoId: rp.permisoId,
        deletedAt: rp.deletedAt,
        permiso: rp.permiso
          ? {
              permisoId: rp.permiso.permisoId,
              nombre: rp.permiso.nombre,
              descripcion: rp.permiso.descripcion,
              recurso: rp.permiso.recurso,
              accion: rp.permiso.accion,
            }
          : null,
      })),
    };
  }

  static toAssignment(raw: any): RolePermissionAssignmentEntity | null {
    if (!raw) return null;
    return {
      rolPermisoId: raw.rolPermisoId,
      rolId: raw.rolId,
      permisoId: raw.permisoId,
      deletedAt: raw.deletedAt,
    };
  }
}
