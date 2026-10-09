import { EstadoPeriodo } from 'src/generated/prisma/enums';
import type { PeriodRow } from '../infrastructure/repositories/period.include';

/**
 * Factory para construir filas `PeriodRow` tipadas en specs.
 *
 * Reemplaza al `new PeriodEntity(...)` que dominaba los specs del BC
 * (issue #366 Nivel 2 piloto). Cada override se pisa sobre defaults
 * sensatos para mantener los tests concisos.
 *
 * Como `periodInclude = {}`, `PeriodRow` es el shape plano del modelo
 * `Periodos` (sin relaciones hidratadas). Los defaults reflejan el
 * modelo:
 *   - periodoId / nombre / fechas en formato canon 2026-01
 *   - estado: ABIERTO (default del schema Prisma)
 *   - creadoPor / actualizadoPor: null
 *   - deletedAt: null (soft delete)
 *   - createdAt / updatedAt: enero 2026
 *
 * Si Prisma cambia la forma del modelo `Periodos`, el factory lo detecta
 * en compile-time.
 *
 * @example
 *   const row = periodRow({ periodoId: 7, estado: EstadoPeriodo.CERRADO });
 *   prisma.periodos.findUnique.mockResolvedValue(row);
 */
export function periodRow(overrides: Partial<PeriodRow> = {}): PeriodRow {
  const base: PeriodRow = {
    periodoId: 1,
    nombre: '2026-01',
    fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
    fechaFin: new Date('2026-01-31T23:59:59.999Z'),
    fechaVencimiento: new Date('2026-02-15T23:59:59.999Z'),
    estado: EstadoPeriodo.ABIERTO,
    creadoPor: null,
    actualizadoPor: null,
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  return { ...base, ...overrides };
}
