import { Prisma } from 'src/generated/prisma/client';
import type { SectorRow } from '../infrastructure/repositories/sector.include';

/**
 * Factory para construir filas `SectorRow` tipadas en specs.
 *
 * Reemplaza al `new SectorEntity(...)` que dominaba los specs del BC
 * (issue #366 Nivel 2 piloto). Cada override se pisa sobre defaults
 * sensatos para mantener los tests concisos.
 *
 * Incluye TODOS los campos requeridos por el tipo `SectorRow`
 * (cuando la relación `comunidades` se incluye, Prisma devuelve la fila
 * completa con todos sus atributos, no solo los referenciados). Esto
 * fuerza type-safety en tests: si Prisma cambia la forma del modelo
 * `Sectores` o `Comunidades`, el factory lo detecta en compile-time.
 *
 * @example
 *   const row = sectorRow({ sectorId: 7, codigo: 'X-7' });
 *   prisma.sectores.findFirst.mockResolvedValue(row);
 */
export function sectorRow(overrides: Partial<SectorRow> = {}): SectorRow {
  const base: SectorRow = {
    sectorId: 1,
    nombre: 'Sector Test',
    codigo: 'SEC-TEST-001',
    comunidadId: 1,
    comunidades: {
      comunidadId: 1,
      codigo: 'COM-001',
      nombre: 'Comunidad Test',
      deletedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      porcentajeTasaSeguridad: new Prisma.Decimal(0),
    },
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  return { ...base, ...overrides };
}
