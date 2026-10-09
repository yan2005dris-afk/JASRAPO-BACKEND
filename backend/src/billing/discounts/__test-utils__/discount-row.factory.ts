import { Prisma, TipoDescuento } from 'src/generated/prisma/client';
import type { DiscountRow } from '../infrastructure/repositories/discount.include';

/**
 * Factory para construir filas `DiscountRow` tipadas en specs.
 *
 * Reemplaza al `new DiscountEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC discounts. Cada override se pisa sobre defaults
 * sensatos. Si Prisma cambia la forma del modelo `CatalogoDescuento`,
 * el factory lo detecta en compile-time.
 *
 * @example
 *   const row = discountRow({ id: 7, nombre: 'Descuento test' });
 *   prisma.catalogoDescuento.findUnique.mockResolvedValue(row);
 */
export function discountRow(
  overrides: Partial<DiscountRow> = {},
): DiscountRow {
  const base: DiscountRow = {
    id: 1,
    nombre: 'Descuento Test',
    descripcion: 'Descuento de prueba',
    tipoDescuento: TipoDescuento.TERCERA_EDAD,
    valor: new Prisma.Decimal(10),
    esPorcentaje: true,
    rubroId: null,
    rubro: null,
    activo: true,
    aplicaAutomatico: false,
  };

  return { ...base, ...overrides };
}
