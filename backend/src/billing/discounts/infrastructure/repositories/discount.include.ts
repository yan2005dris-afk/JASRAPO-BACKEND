import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de
 * CatalogoDescuento.
 *
 * Trae la relation `rubro` con `select` limitado a 4 campos (rubroId,
 * nombre, tipoRubro, precioUnitario) — es la unica relation que el
 * BC expone en su DTO response. Mantener el `select` explicito (no
 * traer toda la fila de `Rubros`) preserva la shape exacta que el
 * `DiscountMapper.toDomain` producia antes.
 */
export const discountInclude = {
  rubro: {
    select: {
      rubroId: true,
      nombre: true,
      tipoRubro: true,
      precioUnitario: true,
    },
  },
} as const satisfies Prisma.CatalogoDescuentoInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna. Reemplaza al brand
 * `DiscountEntity` (eliminado en #366 Nivel 2): antes era una clase
 * anemica con `Object.assign(this, partial)` que no agregaba
 * comportamiento y obligaba a un mapper ceremonial (con `toDomain`
 * 1:1 y `toPrisma*` helpers). Ahora la "entity" es directamente el
 * row de Prisma — unico punto de verdad estructural.
 */
export type DiscountRow = Prisma.CatalogoDescuentoGetPayload<{
  include: typeof discountInclude;
}>;
