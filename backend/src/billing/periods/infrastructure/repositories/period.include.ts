import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Periodos.
 *
 * Actualmente `{}` (vacio) porque ninguna query existente hidrata
 * relaciones: el modelo `Periodos` tiene 6 relations (lecturas, prefacturas,
 * lotes, rutas, reemplazosOrigen, reemplazosDestino) pero el repo opera
 * siempre a nivel de fila plana.
 *
 * Si en el futuro un use-case necesita traer, p. ej., el conteo de
 * lecturas desde otra tabla, se anade `{ lecturas: { _count: true } }` o
 * `{ lecturas: { select: { ... } } }` aca y `PeriodRow` se ampla en forma
 * type-safe sin necesidad de cambiar consumidores (eso es lo bueno del
 * `as const satisfies Prisma.PeriodosInclude`).
 *
 * Centralizar la inclusion aca evita divergencia entre queries.
 */
export const periodInclude = {
  // lecturas: { _count: true },
  // prefacturas: { _count: true },
} as const satisfies Prisma.PeriodosInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `PeriodEntity` (eliminado en #366 Nivel 2): antes era una clase
 * anemica con `Object.assign(this, partial)` que no agregaba
 * comportamiento y obligaba a un mapper ceremonial (`PeriodMapper`
 * con `toDomain`/`toDomainList` 1:1). Ahora la "entity" es directamente
 * el row de Prisma — unico punto de verdad estructural.
 */
export type PeriodRow = Prisma.PeriodosGetPayload<{
  include: typeof periodInclude;
}>;
