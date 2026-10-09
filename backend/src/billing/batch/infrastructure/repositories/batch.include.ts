import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en las queries del repositorio de Lote.
 *
 * Trae las 3 relations planas: `comunidad` (sin hydrate),
 * `periodoRel` (sin hydrate), `ruta` (sin hydrate). El mapper
 * `BatchMapper.toDomain` consumia este shape para poblar los
 * sub-objects del entity; al borrarlo, los consumers proyectan
 * estas relations desde el row Prisma directamente.
 *
 * NO incluye `prefacturas` (cross-BC a billing/pre-invoice). Esa
 * relation se sigue manejando con la entity `PreInvoiceEntity`
 * ceremonial hasta que ese BC migre a Nivel 2.
 */
export const batchInclude = {
  comunidad: true,
  periodoRel: true,
  ruta: true,
} as const satisfies Prisma.LoteInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `BatchEntity` (eliminado en #366 Nivel 2): antes era una clase
 * anemica con `Object.assign(this, partial)` que no agregaba
 * comportamiento y obligaba a un mapper ceremonial. Ahora la
 * "entity" es directamente el row de Prisma.
 */
export type BatchRow = Prisma.LoteGetPayload<{
  include: typeof batchInclude;
}>;
