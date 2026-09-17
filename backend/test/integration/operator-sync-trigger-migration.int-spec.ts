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
    '../../prisma/migrations/20260915100000_fix_operator_sync_trigger_table_scope/migration.sql',
  ),
  'utf8',
);

void describeMigration('operator sync trigger migration', () => {
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
    const schema = `operator_sync_test_${process.pid}_${schemaCounter++}`;

    try {
      await client.query(`CREATE SCHEMA "${schema}"`);
      await client.query(`SET search_path TO "${schema}"`);
      await client.query(`
        CREATE TYPE "OperatorSyncChangeOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE');
        CREATE TABLE "operator_sync_changes" (
          "sequence_id" bigserial PRIMARY KEY,
          "entity_type" text NOT NULL,
          "entity_id" bigint NOT NULL,
          "operation" "OperatorSyncChangeOperation" NOT NULL,
          "periodo_id" integer,
          "ruta_id" bigint,
          "comunidad_id" integer,
          "sector_id" integer,
          "medidor_id" bigint,
          "payload" jsonb NOT NULL
        );
        CREATE TABLE "contratos" (
          "contrato_id" bigint PRIMARY KEY,
          "comunidad_id" integer,
          "sector_id" integer
        );
        CREATE TABLE "historial_medidores" (
          "medidor_id" bigint NOT NULL,
          "contrato_id" bigint NOT NULL,
          "fecha_hasta" timestamptz
        );
        CREATE TABLE "medidores" (
          "medidor_id" bigint PRIMARY KEY,
          "borrado_en" timestamptz,
          "numero" text NOT NULL
        );
      `);
      await client.query(migration);
      await client.query(`
        CREATE TRIGGER operator_sync_medidores
        AFTER INSERT OR UPDATE OR DELETE ON medidores
        FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
      `);
      await callback(client);
    } finally {
      client.release();
      await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
    }
  }

  void it('updates a meter without referencing route-only fields', async () => {
    await withSchema(async (client) => {
      await client.query(
        `INSERT INTO medidores (medidor_id, numero) VALUES (1, 'M-001')`,
      );

      const result = await client.query(
        `UPDATE medidores SET numero = 'M-002' WHERE medidor_id = 1`,
      );
      assert.equal(result.rowCount, 1);

      const changes = await client.query(
        `SELECT entity_type, entity_id, operation, medidor_id FROM operator_sync_changes`,
      );
      assert.deepEqual(changes.rows, [
        {
          entity_type: 'medidores',
          entity_id: '1',
          operation: 'UPDATE',
          medidor_id: '1',
        },
      ]);
    });
  });
});
