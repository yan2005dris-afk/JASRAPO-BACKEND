import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('collection status decoupling migration', () => {
  it('normalizes the legacy marker before replacing the enum', () => {
    const migration = readFileSync(
      resolve(
        __dirname,
        '../../../../../prisma/migrations/20260916100000_remove_agreement_from_collection_status/migration.sql',
      ),
      'utf8',
    );

    const normalization = migration.indexOf(
      'WHERE "estado_cobranza" = \'EN_CONVENIO\'',
    );
    const enumReplacement = migration.indexOf(
      "CREATE TYPE \"EstadoCobranzaContrato_new\" AS ENUM ('AL_DIA', 'EN_MORA')",
    );

    expect(normalization).toBeGreaterThanOrEqual(0);
    expect(enumReplacement).toBeGreaterThan(normalization);
    expect(migration).not.toContain(
      "ENUM ('AL_DIA', 'EN_MORA', 'EN_CONVENIO')",
    );
  });
});
