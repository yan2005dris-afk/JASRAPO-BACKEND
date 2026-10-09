import type { RoleRow } from '../infrastructure/repositories/role.include';

/**
 * Factory para construir filas `RoleRow` tipadas en specs.
 *
 * Reemplaza al `new RoleEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC identity/roles. Cada override se pisa sobre defaults
 * sensatos. Si Prisma cambia la forma del modelo `Roles`, el factory
 * lo detecta en compile-time.
 *
 * Por defecto, `rolPermisos` queda como `[]` (las queries que usan
 * `select` por separado no hidratan la relation). Para tests que
 * necesitan permisos asociados, se pasa un array en el override.
 *
 * @example
 *   const row = roleRow({ rolId: 7, nombre: 'Admin' });
 *   prisma.roles.findUnique.mockResolvedValue(row);
 */
export function roleRow(overrides: Partial<RoleRow> = {}): RoleRow {
  const base: Partial<RoleRow> = {
    rolId: 1,
    nombre: 'Administrador',
    deletedAt: null,
    rolPermisos: [],
  };

  return { ...base, ...overrides } as RoleRow;
}
