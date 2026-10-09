import { Prisma } from 'src/generated/prisma/client';
import type { RubroRow } from '../infrastructure/repositories/rubro.include';

/**
 * Factory para construir filas `RubroRow` tipadas en specs.
 *
 * Reemplaza al `new RubroEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC rubros. Cada override se pisa sobre defaults
 * sensatos. Si Prisma cambia la forma del modelo `Rubros`, el factory
 * lo detecta en compile-time.
 *
 * @example
 *   const row = rubroRow({ rubroId: 7, tipoRubro: 'FIJO' });
 *   prisma.rubros.findUnique.mockResolvedValue(row);
 */
export function rubroRow(overrides: Partial<RubroRow> = {}): RubroRow {
  const base: Partial<RubroRow> = {
    rubroId: 1,
    codigoSri: '001',
    nombre: 'Consumo Agua',
    descripcion: 'Consumo de agua potable m3',
    precioUnitario: new Prisma.Decimal(0.5),
    tipoRubro: 'VARIABLE',
    tarifaImpuestoId: 1,
    categoriaTarifaId: null,
    codigoSistemaRubro: null,
    activo: true,
    esAutomatico: false,
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    // tarifaImpuesto queda como null (FK opcional) por default.
  };

  return { ...base, ...overrides } as RubroRow;
}
