import type { PermissionEntity } from '../../domain/entities/permission.entity';

export class PermissionMapper {
  static toEntity(raw: any): PermissionEntity | null {
    if (!raw) return null;
    return {
      permisoId: raw.permisoId,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      recurso: raw.recurso,
      accion: raw.accion,
      deletedAt: raw.deletedAt,
    };
  }
}
