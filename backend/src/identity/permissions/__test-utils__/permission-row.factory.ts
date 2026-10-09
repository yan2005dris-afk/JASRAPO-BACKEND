import type { PermissionRow } from '../infrastructure/repositories/permission.include';

/**
 * Factory para construir filas `PermissionRow` tipadas en specs.
 *
 * Reemplaza al `new PermissionEntity(...)` (que era `Object.assign(this, partial)`)
 * en los specs del BC permissions. Cada override se pisa sobre defaults
 * sensatos. Si Prisma cambia la forma del modelo `Permisos`, el factory
 * lo detecta en compile-time.
 *
 * @example
 *   const row = permissionRow({ permisoId: 7, recurso: 'sectors' });
 *   prisma.permisos.findUnique.mockResolvedValue(row);
 */
export function permissionRow(
  overrides: Partial<PermissionRow> = {},
): PermissionRow {
  const base: PermissionRow = {
    permisoId: 1,
    nombre: 'Consultar Usuarios',
    descripcion: 'Permite consultar usuarios',
    recurso: 'users',
    accion: 'read',
    deletedAt: null,
  };

  return { ...base, ...overrides };
}
