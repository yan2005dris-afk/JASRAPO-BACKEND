import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Sesiones.
 *
 * Actualmente `{}` (vacio) porque ninguna query existente hidrata la
 * relation `usuario` (la unica del modelo). Las queries siempre operan
 * a nivel de fila plana (CRUD + busquedas por sesionId/usuarioId).
 * Si en el futuro un use-case necesita los datos del usuario, se
 * anade aca y `SessionRow` se ampla type-safe.
 */
export const sessionInclude = {
  // usuario: true,
} as const satisfies Prisma.SesionesInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `SessionEntity` (eliminado en #366 Nivel 2): antes era una clase
 * anemica con `Object.assign(this, partial)` que no agregaba
 * comportamiento y obligaba a un mapper ceremonial. Ahora la "entity"
 * es directamente el row de Prisma.
 */
export type SessionRow = Prisma.SesionesGetPayload<{
  include: typeof sessionInclude;
}>;
