import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Rubros.
 *
 * Trae la relation `tarifaImpuesto` con todos sus campos porque el
 * `RubroResponseDto` la expone (en el campo `tarifaImpuesto` anidado).
 * El DTO actual la renderiza a `TarifaImpuestoNestedDto` con 4 campos.
 *
 * Las otras relations de Rubro (`catalogoDescuento`, `prefacturaDetalle`)
 * no se hidratan por default — son listas que solo se consultan en
 * paths especificos (e.g., `countPrefacturaDetalleReferences`).
 */
export const rubroInclude = {
  tarifaImpuesto: true,
} as const satisfies Prisma.RubrosInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `RubroEntity` (eliminado en #366 Nivel 2): antes era una clase
 * anemica con `Object.assign(this, partial)` que no agregaba
 * comportamiento y obligaba a un mapper ceremonial. Ahora la "entity"
 * es directamente el row de Prisma — unico punto de verdad estructural.
 */
export type RubroRow = Prisma.RubrosGetPayload<{
  include: typeof rubroInclude;
}>;
