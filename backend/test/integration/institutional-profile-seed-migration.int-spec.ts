import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool, type PoolClient } from 'pg';

const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const describeMigration = databaseUrl ? describe : describe.skip;
const migration = readFileSync(
  resolve(
    __dirname,
    '../../prisma/migrations/20260824011000_seed_initial_institutional_profile/migration.sql',
  ),
  'utf8',
);

describeMigration('institutional profile seed migration', () => {
  let pool: Pool;
  let schemaCounter = 0;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
  });

  afterAll(async () => {
    await pool.end();
  });

  async function withSchema(
    callback: (schema: string, client: PoolClient) => Promise<void>,
  ): Promise<void> {
    const client = await pool.connect();
    const schema = `migration_test_${process.pid}_${schemaCounter++}`;

    try {
      await client.query(`CREATE SCHEMA "${schema}"`);
      await client.query(`SET search_path TO "${schema}"`);
      await client.query(`
        CREATE TABLE "emisores" (
          "id" serial PRIMARY KEY,
          "estado" text NOT NULL
        );
        CREATE TABLE "perfiles_institucionales" (
          "perfil_institucional_id" serial PRIMARY KEY,
          "emisor_id" integer NOT NULL,
          "version" text NOT NULL UNIQUE,
          "vigente_desde" timestamptz NOT NULL,
          "siglas" text NOT NULL,
          "decreto_numero" text,
          "registro_oficial_numero" text,
          "registro_oficial_fecha" date,
          "fecha_fundacion" date,
          "ubicacion" jsonb NOT NULL,
          "correo" text NOT NULL,
          "telefonos" jsonb NOT NULL,
          "representantes" jsonb NOT NULL,
          "logo_referencia" jsonb NOT NULL,
          "marca_agua_referencia" jsonb NOT NULL,
          "textos_legales" jsonb NOT NULL
        );
      `);
      await callback(schema, client);
    } finally {
      client.release();
      await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
    }
  }

  it('fails when there is no active issuer', async () => {
    await withSchema(async (_schema, client) => {
      await expect(client.query(migration)).rejects.toThrow(
        'se requiere exactamente un emisor activo, pero no existe ninguno',
      );
    });
  });

  it('fails when there is more than one active issuer', async () => {
    await withSchema(async (_schema, client) => {
      await client.query(
        `INSERT INTO "emisores" ("estado") VALUES ('ACTIVO'), ('ACTIVO')`,
      );

      await expect(client.query(migration)).rejects.toThrow(
        'se requiere exactamente un emisor activo, pero existen 2',
      );
    });
  });

  it('associates the sole active issuer and remains idempotent', async () => {
    await withSchema(async (_schema, client) => {
      const issuer = await client.query(
        `INSERT INTO "emisores" ("estado") VALUES ('ACTIVO') RETURNING "id"`,
      );

      await client.query(migration);
      await client.query(migration);

      const profiles = await client.query(
        `SELECT "emisor_id" FROM "perfiles_institucionales" WHERE "version" = 'v1'`,
      );
      expect(profiles.rows).toEqual([{ emisor_id: issuer.rows[0].id }]);
    });
  });
});
