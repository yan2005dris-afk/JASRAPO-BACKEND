import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Sectores.
 *
 * Centraliza las relaciones que el BC `sectors` trae siempre. El `as const`
 * congela el shape para que el tipo `SectorRow` se infiera correctamente
 * sin necesidad de un mapper intermedio.
 */
export const sectorInclude = {
  comunidades: true,
} as const satisfies Prisma.SectoresInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `SectorEntity` (eliminado en issue #366 Nivel 2): antes era una clase
 * anémica con constructor `(readonly x, readonly y, ...)` que no agregaba
 * comportamiento y obligaba a un mapper ceremonial. Ahora la "entity" es
 * directamente el row de Prisma — único punto de verdad estructural.
 */
export type SectorRow = Prisma.SectoresGetPayload<{
  include: typeof sectorInclude;
}>;
