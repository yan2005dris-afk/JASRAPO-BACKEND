import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('move coordinates to contratos migration', () => {
  const migration = readFileSync(
    resolve(
      __dirname,
      '../../../../../prisma/migrations/20260925000000_move_coordinates_to_contratos/migration.sql',
    ),
    'utf8',
  );

  it('adds the coordinate columns before backfilling, constraining, and dropping them', () => {
    const addColumnsIndex = migration.indexOf('ADD COLUMN "latitud"');
    const backfillIndex = migration.indexOf('UPDATE "contratos"');
    const constraintIndex = migration.indexOf(
      'ADD CONSTRAINT "contratos_coordenadas_chk"',
    );
    const dropColumnIndex = migration.indexOf('DROP COLUMN "latitud"');

    expect(addColumnsIndex).toBeGreaterThan(-1);
    expect(backfillIndex).toBeGreaterThan(-1);
    expect(constraintIndex).toBeGreaterThan(-1);
    expect(dropColumnIndex).toBeGreaterThan(-1);

    expect(addColumnsIndex).toBeLessThan(backfillIndex);
    expect(backfillIndex).toBeLessThan(constraintIndex);
    expect(constraintIndex).toBeLessThan(dropColumnIndex);
  });

  it('backfills only from an open, non-deleted historial link', () => {
    expect(migration).toContain('h."fecha_hasta" IS NULL');
    expect(migration).toContain('h."borrado_en" IS NULL');
  });
});
