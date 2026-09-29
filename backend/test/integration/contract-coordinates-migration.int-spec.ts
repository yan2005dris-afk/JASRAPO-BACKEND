import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { Pool, type PoolClient } from 'pg';
import { after, before, describe, it } from 'node:test';

const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const describeMigration = databaseUrl ? describe : describe.skip;
const migration = readFileSync(
  resolve(
    __dirname,
    '../../prisma/migrations/20260925000000_move_coordinates_to_contratos/migration.sql',
  ),
  'utf8',
);

void describeMigration('move coordinates to contratos migration', () => {
  let pool: Pool;
  let schemaCounter = 0;

  before(() => {
    pool = new Pool({ connectionString: databaseUrl });
  });

  after(async () => {
    await pool.end();
  });

  async function withSchema(
    callback: (client: PoolClient) => Promise<void>,
  ): Promise<void> {
    const client = await pool.connect();
    const schema = `coordinates_migration_test_${process.pid}_${schemaCounter++}`;

    try {
      await client.query(`CREATE SCHEMA "${schema}"`);
      await client.query(`SET search_path TO "${schema}"`);
      await client.query(`
        CREATE TABLE "contratos" (
          "contrato_id" bigint PRIMARY KEY
        );
        CREATE TABLE "medidores" (
          "medidor_id" bigint PRIMARY KEY,
          "latitud" DECIMAL(10,8),
          "longitud" DECIMAL(11,8)
        );
        CREATE TABLE "historial_medidores" (
          "medidor_id" bigint NOT NULL,
          "contrato_id" bigint NOT NULL,
          "fecha_hasta" timestamptz,
          "borrado_en" timestamptz
        );
      `);
      await callback(client);
    } finally {
      client.release();
      await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
    }
  }

  void it('backfills coordinates from the contract single open historial link', async () => {
    await withSchema(async (client) => {
      await client.query(`INSERT INTO contratos (contrato_id) VALUES (1)`);
      await client.query(
        `INSERT INTO medidores (medidor_id, latitud, longitud) VALUES (1, -1.8021, -80.7554)`,
      );
      await client.query(
        `INSERT INTO historial_medidores (medidor_id, contrato_id, fecha_hasta, borrado_en)
         VALUES (1, 1, NULL, NULL)`,
      );

      await client.query(migration);

      const result = await client.query<{
        latitud: string | null;
        longitud: string | null;
      }>(`SELECT latitud, longitud FROM contratos WHERE contrato_id = 1`);
      assert.equal(result.rows[0].latitud, '-1.80210000');
      assert.equal(result.rows[0].longitud, '-80.75540000');
    });
  });

  void it('does not copy a closed historial link', async () => {
    await withSchema(async (client) => {
      await client.query(`INSERT INTO contratos (contrato_id) VALUES (2)`);
      await client.query(
        `INSERT INTO medidores (medidor_id, latitud, longitud) VALUES (2, -1.5, -80.5)`,
      );
      await client.query(
        `INSERT INTO historial_medidores (medidor_id, contrato_id, fecha_hasta, borrado_en)
         VALUES (2, 2, now(), NULL)`,
      );

      await client.query(migration);

      const result = await client.query<{ latitud: string | null }>(
        `SELECT latitud FROM contratos WHERE contrato_id = 2`,
      );
      assert.equal(result.rows[0].latitud, null);
    });
  });

  void it('does not copy a soft-deleted historial link', async () => {
    await withSchema(async (client) => {
      await client.query(`INSERT INTO contratos (contrato_id) VALUES (3)`);
      await client.query(
        `INSERT INTO medidores (medidor_id, latitud, longitud) VALUES (3, -1.5, -80.5)`,
      );
      await client.query(
        `INSERT INTO historial_medidores (medidor_id, contrato_id, fecha_hasta, borrado_en)
         VALUES (3, 3, NULL, now())`,
      );

      await client.query(migration);

      const result = await client.query<{ latitud: string | null }>(
        `SELECT latitud FROM contratos WHERE contrato_id = 3`,
      );
      assert.equal(result.rows[0].latitud, null);
    });
  });

  void it('does not copy a half coordinate pair from the linked meter', async () => {
    await withSchema(async (client) => {
      await client.query(`INSERT INTO contratos (contrato_id) VALUES (4)`);
      await client.query(
        `INSERT INTO medidores (medidor_id, latitud, longitud) VALUES (4, -1.5, NULL)`,
      );
      await client.query(
        `INSERT INTO historial_medidores (medidor_id, contrato_id, fecha_hasta, borrado_en)
         VALUES (4, 4, NULL, NULL)`,
      );

      await client.query(migration);

      const result = await client.query<{ latitud: string | null }>(
        `SELECT latitud FROM contratos WHERE contrato_id = 4`,
      );
      assert.equal(result.rows[0].latitud, null);
    });
  });

  void it('leaves a contract with no open historial link at NULL', async () => {
    await withSchema(async (client) => {
      await client.query(`INSERT INTO contratos (contrato_id) VALUES (5)`);

      await client.query(migration);

      const result = await client.query<{
        latitud: string | null;
        longitud: string | null;
      }>(`SELECT latitud, longitud FROM contratos WHERE contrato_id = 5`);
      assert.equal(result.rows[0].latitud, null);
      assert.equal(result.rows[0].longitud, null);
    });
  });

  void it('drops the coordinate columns from medidores', async () => {
    await withSchema(async (client) => {
      await client.query(migration);

      const columns = await client.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = current_schema() AND table_name = 'medidores'
           AND column_name IN ('latitud', 'longitud')`,
      );
      assert.equal(columns.rows.length, 0);
    });
  });

  void it('rejects a half coordinate pair via the CHECK constraint', async () => {
    await withSchema(async (client) => {
      await client.query(migration);
      await client.query(`INSERT INTO contratos (contrato_id) VALUES (6)`);

      await assert.rejects(
        async () => {
          await client.query(
            `UPDATE contratos SET latitud = -1.5, longitud = NULL WHERE contrato_id = 6`,
          );
        },
        (error: unknown) => {
          assert.equal((error as { code?: string })?.code, '23514');
          return true;
        },
      );
    });
  });

  void it('rejects an out-of-range latitude via the CHECK constraint', async () => {
    await withSchema(async (client) => {
      await client.query(migration);
      await client.query(`INSERT INTO contratos (contrato_id) VALUES (7)`);

      await assert.rejects(
        async () => {
          await client.query(
            `UPDATE contratos SET latitud = 91, longitud = -80.5 WHERE contrato_id = 7`,
          );
        },
        (error: unknown) => {
          assert.equal((error as { code?: string })?.code, '23514');
          return true;
        },
      );
    });
  });
});
