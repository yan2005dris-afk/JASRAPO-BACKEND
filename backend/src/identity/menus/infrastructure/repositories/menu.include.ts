import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Menus.
 *
 * Actualmente `{}` (vacio) porque ninguna query existente hidrata
 * relaciones: el modelo `Menus` tiene 3 relations (permisosMenu, padre,
 * hijos) pero el repo opera solo a nivel de fila plana (queries que
 * filtran por permisos del usuario + recursividad para traer padres).
 * Si en el futuro un use-case necesita los hijos, se anade aca y
 * `MenuRow` se ampla type-safe automaticamente.
 */
export const menuInclude = {
  // padre: true,
  // hijos: true,
} as const satisfies Prisma.MenusInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `MenuEntity` (eliminado en #366 Nivel 2): antes era una clase anemica
 * con `Object.assign(this, partial)` que no agregaba comportamiento y
 * obligaba a un mapper ceremonial. Ahora la "entity" es directamente el
 * row de Prisma.
 */
export type MenuRow = Prisma.MenusGetPayload<{
  include: typeof menuInclude;
}>;
