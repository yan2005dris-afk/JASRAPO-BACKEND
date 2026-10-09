import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Permisos.
 *
 * Actualmente `{}` (vacio) porque ninguna query existente hidrata
 * relaciones: el modelo `Permisos` tiene 3 relations (menuPermisos,
 * rolPermisos, usuarioPermisos) pero el repo opera a nivel de fila
 * plana (CRUD simple). Si en el futuro un use-case necesita traer
 * los menus o roles asociados, se anade aca y `PermissionRow` se ampla
 * type-safe automaticamente.
 */
export const permissionInclude = {
  // menuPermisos: true,
  // rolPermisos: true,
} as const satisfies Prisma.PermisosInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `PermissionEntity` (eliminado en #366 Nivel 2): antes era una clase
 * anemica con `Object.assign(this, partial)` que no agregaba
 * comportamiento y obligaba a un mapper ceremonial. Ahora la "entity"
 * es directamente el row de Prisma.
 */
export type PermissionRow = Prisma.PermisosGetPayload<{
  include: typeof permissionInclude;
}>;
