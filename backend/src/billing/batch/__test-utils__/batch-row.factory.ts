import { Prisma } from 'src/generated/prisma/client';
import type { BatchRow } from '../infrastructure/repositories/batch.include';

/**
 * Factory para construir filas `BatchRow` tipadas en specs.
 *
 * Reemplaza al `new BatchEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC billing/batch. Cada override se pisa sobre defaults
 * sensatos. Si Prisma cambia la forma del modelo `Lote`, el factory
 * lo detecta en compile-time.
 *
 * Por defecto, `comunidad`, `periodoRel` y `ruta` quedan como `null`
 * (el `select: true` las trae, pero su contenido depende del estado
 * del mock; sin override explicito, el row tiene `null` para esas
 * relations).
 *
 * @example
 *   const row = batchRow({ loteId: 7n, estado: 'ENVIADO' });
 *   prisma.lote.findUnique.mockResolvedValue(row);
 */
export function batchRow(overrides: Partial<BatchRow> = {}): BatchRow {
  const base: Partial<BatchRow> = {
    loteId: 1n,
    comunidadId: 1,
    periodoId: 1,
    estado: 'BORRADOR',
    totalMonto: new Prisma.Decimal(0),
    notas: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    creadoPor: 'admin',
    actualizadoPor: null,
    totalEmisiones: 0,
    mes: 1,
    rutaId: null,
    // comunidad, periodoRel, ruta quedan undefined (no populamos en el
    // factory por default; el caller puede override). Cast a BatchRow
    // al final para que TS acepte el shape parcial.
  };

  return { ...base, ...overrides } as BatchRow;
}
