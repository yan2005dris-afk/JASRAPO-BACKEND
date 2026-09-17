import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('contract legacy-state removal migration', () => {
  it('updates installed routines before dropping the legacy column and enum', () => {
    const migration = readFileSync(
      resolve(
        __dirname,
        '../../../../../prisma/migrations/20260919000000_remove_contract_legacy_state/migration.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('c.estado_servicio');
    expect(migration).toContain('DROP COLUMN IF EXISTS "estado"');
    expect(migration).toContain('DROP TYPE IF EXISTS "EstadoContrato"');
    expect(migration.indexOf('EXECUTE routine_definition')).toBeLessThan(
      migration.indexOf('DROP COLUMN IF EXISTS'),
    );
  });
});
