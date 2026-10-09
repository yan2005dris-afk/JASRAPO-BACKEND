import { Prisma } from 'src/generated/prisma/client';
import type { CommunityRow } from '../infrastructure/repositories/community.include';

/**
 * Factory para construir filas `CommunityRow` tipadas en specs.
 *
 * Reemplaza al `new CommunityEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC communities. Cada override se pisa sobre defaults
 * sensatos. Si Prisma cambia la forma del modelo `Comunidades`, el
 * factory lo detecta en compile-time.
 *
 * @example
 *   const row = communityRow({ comunidadId: 7, codigo: 'COM-007' });
 *   prisma.comunidades.findFirst.mockResolvedValue(row);
 */
export function communityRow(
  overrides: Partial<CommunityRow> = {},
): CommunityRow {
  const base: CommunityRow = {
    comunidadId: 1,
    nombre: 'San José',
    codigo: 'SJ-001',
    porcentajeTasaSeguridad: new Prisma.Decimal(0),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    sector: [],
  };

  return { ...base, ...overrides };
}
