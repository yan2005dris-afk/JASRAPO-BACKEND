/**
 * Re-exports canonicos de `RoleRow` y `RolPermisoRow` para los
 * consumidores de dominio.
 *
 * Los tipos se declaran en `infrastructure/repositories/role.include.ts`
 * (donde vive `roleInclude`, el detalle Prisma), pero el dominio
 * consume desde aca. Esto preserva la inversion de dependencias:
 * el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar las firmas de los re-exports.
 *
 * Antes existia la interface `RolePermission` (un VO copiado del row
 * Prisma). Se reemplaza por `RolPermisoRow`, derivado del tipo de la
 * relation en `RoleRow` — asi cuando Prisma cambie la forma de la
 * tabla, `RolPermisoRow` se actualiza automaticamente.
 */
export type {
  RoleRow,
  RolPermisoRow,
} from '../../infrastructure/repositories/role.include';

export interface CreateRoleRepositoryData {
  nombre: string;
}

export interface UpdateRoleRepositoryData {
  nombre?: string;
  deletedAt?: Date | null;
}
