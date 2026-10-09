import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Roles.
 *
 * Trae la relation `rolPermisos` (link table a `Permisos`) con `where:
 * { deletedAt: null }` y un join nested a `permiso` con `select` limitado
 * a 5 campos. Es la unica relation del modelo `Roles` y se usa para
 * que `findUnique`/`update` retornen el rol con sus permisos asociados
 * (necesario para el `RoleDetailResponseDto`).
 *
 * Queries como `findByName`, `findAll`, `create` usan `select` por
 * separado (solo los 3 campos planos), por lo que `rolPermisos` queda
 * como `[]` en runtime — esto es correcto porque el listado de roles
 * no expone los permisos individuales.
 */
export const roleInclude = {
  rolPermisos: {
    where: { deletedAt: null },
    orderBy: [
      { permiso: { recurso: 'asc' as const } },
      { permiso: { accion: 'asc' as const } },
    ],
    include: {
      permiso: {
        select: {
          permisoId: true,
          nombre: true,
          descripcion: true,
          recurso: true,
          accion: true,
        },
      },
    },
  },
} as const satisfies Prisma.RolesInclude;

/**
 * Tipo de fila Prisma para Role con el include por defecto.
 *
 * Reemplaza al brand `RoleEntity` (eliminado en #366 Nivel 2): antes
 * era una clase anemica con `Object.assign(this, partial)` que no
 * agregaba comportamiento y obligaba a un mapper ceremonial. Ahora
 * la "entity" es directamente el row de Prisma.
 */
export type RoleRow = Prisma.RolesGetPayload<{
  include: typeof roleInclude;
}>;

/**
 * Tipo de fila Prisma para `RolPermisos` (link table entre Roles y
 * Permisos). Reemplaza a la interface `RolePermission` que vivia en
 * `role.types.ts` y que era solo un VO copiado del row Prisma.
 *
 * Se deriva del tipo de la relation en `RoleRow`, asi cuando Prisma
 * cambie la forma de la tabla, `RolPermisoRow` se actualiza
 * automaticamente.
 */
export type RolPermisoRow = RoleRow['rolPermisos'][number];
