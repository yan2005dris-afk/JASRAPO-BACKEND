import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('NO_APLICA collection status migration', () => {
  it('adds the enum value, backfills pending services, and changes the default', () => {
    const migration = readFileSync(
      resolve(
        __dirname,
        '../../../../../prisma/migrations/20260918000000_add_no_aplica_collection_status/migration.sql',
      ),
      'utf8',
    );

    expect(migration).toContain(
      `CREATE TYPE "EstadoCobranzaContrato_new" AS ENUM ('NO_APLICA', 'AL_DIA', 'EN_MORA')`,
    );
    expect(migration).toContain(
      `WHERE "estado_servicio" IN ('PENDIENTE_PAGO', 'PENDIENTE_INSTALACION')`,
    );
    expect(migration).toContain(
      `ALTER COLUMN "estado_cobranza" SET DEFAULT 'NO_APLICA'`,
    );
    expect(migration).not.toContain('EN_CONVENIO');
  });
});
