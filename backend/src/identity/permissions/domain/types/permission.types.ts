/**
 * Re-export canonico de `PermissionRow` para los consumidores de dominio.
 *
 * El tipo se declara en `infrastructure/repositories/permission.include.ts`
 * (donde vive `permissionInclude`, el detalle Prisma), pero el dominio
 * consume `PermissionRow` desde aca. Esto preserva la inversion de
 * dependencias: el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar la firma del re-export.
 */
export type { PermissionRow } from '../../infrastructure/repositories/permission.include';

export interface CreatePermissionRepositoryData {
  nombre: string;
  descripcion: string;
  recurso: string;
  accion: string;
}

export interface UpdatePermissionRepositoryData {
  nombre?: string;
  descripcion?: string;
  recurso?: string;
  accion?: string;
  deletedAt?: Date | null;
}
