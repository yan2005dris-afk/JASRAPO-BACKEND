import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';

const sql = readFileSync(
  resolve(
    __dirname,
    '../../prisma/migrations/20260901000000_add_work_order_novelties/migration.sql',
  ),
  'utf8',
);
const backfill = sql.slice(sql.indexOf('DO $$'));

void describe(
  'work order novelties additive migration and backfill',
  { timeout: 180_000 },
  () => {
    let container: StartedPostgreSqlContainer;
    let client: Client;

    before(
      async () => {
        container = await new PostgreSqlContainer('postgres:16.3-alpine')
          .withDatabase('jasrapo_test')
          .withUsername('test')
          .withPassword('test')
          .start();

        const uri = container.getConnectionUri();
        execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: uri },
          stdio: 'pipe',
        });

        client = new Client({ connectionString: uri });
        await client.connect();
        await client.query(`
      INSERT INTO catalogo_impuestos(codigo, nombre, activo, created_at, updated_at) VALUES ('99', 'Z', true, now(), now()) ON CONFLICT DO NOTHING;
      INSERT INTO catalogo_tarifas_impuesto(impuesto_id, codigo_porcentaje, descripcion, porcentaje, vigente_desde, activo, created_at, updated_at)
      VALUES ((SELECT id FROM catalogo_impuestos WHERE codigo = '99'), '0', 'Zero', 0, '2026-01-01', true, now(), now()) ON CONFLICT DO NOTHING;
      INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro, tarifa_impuesto_id, creado_en, actualizado_en)
      SELECT code, code, code, 0, kind::"TipoRubro", (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'), now(), now()
      FROM (VALUES ('001', 'VARIABLE'), ('002', 'FIJO')) v(code, kind) ON CONFLICT DO NOTHING;
    `);
      },
      { timeout: 180_000 },
    );

    after(async () => {
      await client?.end();
      await container?.stop();
    });

    async function seedScope(p: string) {
      const res = await client.query<{
        comunidad_id: number;
        periodo_id: number;
        usuario_id: number;
        contrato_id: string;
        medidor_id: string;
        ruta_id: string;
      }>(
        `WITH c AS (INSERT INTO comunidades(nombre, codigo, porcentaje_tasa_seguridad, creado_en, actualizado_en) VALUES ($1, $2, 0, now(), now()) RETURNING comunidad_id),
            pr AS (INSERT INTO periodos(nombre, fecha_inicio, fecha_fin, fecha_vencimiento, creado_en, actualizado_en) VALUES ($3, '2026-01-01', '2026-12-31', '2027-01-15', now(), now()) RETURNING periodo_id),
            u AS (INSERT INTO usuarios(email, contrasenia, creado_en, actualizado_en) VALUES ($4, 'h', now(), now()) RETURNING usuario_id),
            t AS (INSERT INTO categoria_tarifa(nombre, consumo_minimo_mensual, activo, creado_en, actualizado_en) VALUES ($5, 0, true, now(), now()) RETURNING categoria_tarifa_id),
            cl AS (INSERT INTO clientes(apellidos, identificacion, nombres, creado_en, actualizado_en) VALUES ('T', $6, 'B', now(), now()) RETURNING cliente_id),
            co AS (INSERT INTO contratos(cliente_id, categoria_tarifa_id, numero_guia, direccion_suministro, estado, comunidad_id, creado_en, actualizado_en)
                   SELECT cl.cliente_id, t.categoria_tarifa_id, $7, 'D', 'ACTIVO', c.comunidad_id, now(), now() FROM cl, t, c RETURNING contrato_id),
            m AS (INSERT INTO medidores(marca, modelo, serie, estado, creado_en, actualizado_en) VALUES ('M', '1', $8, 'INSTALADO', now(), now()) RETURNING medidor_id),
            at AS (SELECT activity_type_id FROM activity_types WHERE codigo = 'LECTURA'),
                r AS (INSERT INTO rutas(nombre, operario_id, activity_type_id, comunidad_id, periodo_id, creado_en, actualizado_en)
                      SELECT 'R', u.usuario_id, at.activity_type_id, c.comunidad_id, pr.periodo_id, now(), now() FROM u, c, pr, at RETURNING ruta_id)
       SELECT c.comunidad_id, pr.periodo_id, u.usuario_id, co.contrato_id, m.medidor_id, r.ruta_id FROM c, pr, u, co, m, r`,
        [
          `${p} C`,
          `${p}-C`,
          `${p}-P`,
          `${p}@t.local`,
          `${p} T`,
          `${p}-I`,
          `${p}-G`,
          `${p}-M`,
        ],
      );
      return res.rows[0];
    }

    async function seedReading(periodId: number, meterId: string, val: number) {
      const res = await client.query<{ lectura_id: string }>(
        `INSERT INTO lecturas(fecha, lectura_anterior, lectura_actual, consumo_calculado, periodo_id, medidor_id, estado, creado_en, actualizado_en)
       VALUES (now(), 0, $1, $1, $2, $3, 'CON_NOVEDAD', now(), now()) RETURNING lectura_id`,
        [val, periodId, meterId],
      );
      return res.rows[0].lectura_id;
    }

    async function seedOrder(
      routeId: string,
      contractId: string,
      readingId: string,
    ) {
      const res = await client.query<{ orden_trabajo_id: string }>(
        `INSERT INTO ordenes_trabajo(ruta_id, contrato_id, lectura_id, estado, creado_en, actualizado_en)
           VALUES ($1, $2, $3, 'COMPLETADA', now(), now()) RETURNING orden_trabajo_id`,
        [routeId, contractId, readingId],
      );
      return res.rows[0].orden_trabajo_id;
    }

    void it('preflight fails when legacy anomaly has zero candidate work orders without mutating source', async () => {
      const scope = await seedScope('PZ');
      const readingId = await seedReading(
        scope.periodo_id,
        scope.medidor_id,
        10,
      );
      const ins = await client.query<{ anomalia_id: string }>(
        `INSERT INTO lectura_anomalia(lectura_id, observacion, tipo, estado, creado_en, actualizado_en)
       VALUES ($1, 'Orphan', 'FUGA', 'PENDIENTE', now(), now()) RETURNING anomalia_id`,
        [readingId],
      );
      const orphanId = ins.rows[0].anomalia_id;

      await assert.rejects(
        () => client.query(backfill),
        /Backfill blocked: \d+ legacy anomalies have no matching work order/,
      );

      const check = await client.query<{ observacion: string }>(
        'SELECT observacion FROM lectura_anomalia WHERE anomalia_id = $1',
        [orphanId],
      );
      assert.equal(check.rows[0]?.observacion, 'Orphan');
      await client.query(
        'DELETE FROM lectura_anomalia WHERE anomalia_id = $1',
        [orphanId],
      );
    });

    void it('preflight fails when legacy anomaly has multiple candidate work orders without mutating source', async () => {
      const scope = await seedScope('PM');
      const readingId = await seedReading(
        scope.periodo_id,
        scope.medidor_id,
        20,
      );
      await seedOrder(scope.ruta_id, scope.contrato_id, readingId);
      await seedOrder(scope.ruta_id, scope.contrato_id, readingId);

      const ins = await client.query<{ anomalia_id: string }>(
        `INSERT INTO lectura_anomalia(lectura_id, observacion, tipo, estado, creado_en, actualizado_en)
       VALUES ($1, 'Ambiguous', 'MEDIDOR_DAÑADO', 'PENDIENTE', now(), now()) RETURNING anomalia_id`,
        [readingId],
      );
      const ambId = ins.rows[0].anomalia_id;

      await assert.rejects(
        () => client.query(backfill),
        /Backfill blocked: \d+ legacy anomalies have multiple candidate work orders/,
      );

      const check = await client.query(
        'SELECT anomalia_id FROM lectura_anomalia WHERE anomalia_id = $1',
        [ambId],
      );
      assert.equal(check.rows.length, 1);
      await client.query(
        'DELETE FROM lectura_anomalia WHERE anomalia_id = $1',
        [ambId],
      );
      await client.query('DELETE FROM ordenes_trabajo WHERE lectura_id = $1', [
        readingId,
      ]);
    });

    void it('losslessly migrates all states, fields, audit, nulls, and advances sequence idempotently', async () => {
      const scope = await seedScope('LS');
      const states = [
        { legacy: 'PENDIENTE', target: 'OPEN' },
        { legacy: 'EN_REVISION', target: 'IN_PROGRESS' },
        { legacy: 'RESUELTA', target: 'RESOLVED' },
        { legacy: 'DESCARTADA', target: 'CANCELLED' },
      ] as const;

      const insertedIds: string[] = [];
      for (let i = 0; i < states.length; i++) {
        const readingId = await seedReading(
          scope.periodo_id,
          scope.medidor_id,
          30 + i,
        );
        await seedOrder(scope.ruta_id, scope.contrato_id, readingId);
        const isRes = states[i].legacy === 'RESUELTA';
        const ins = await client.query<{ anomalia_id: string }>(
          `INSERT INTO lectura_anomalia(lectura_id, observacion, tipo, estado, resolucion_tipo, consumo_ajustado,
           observacion_resolucion, resuelto_por_usuario_id, resuelto_en, foto_url, borrado_en, creado_en, actualizado_en)
         VALUES ($1, $2, 'FUGA', $3::"EstadoAnomalia", $4, $5, $6, $7, $8, $9, $10, '2026-05-01 10:00:00+00', '2026-05-02 12:00:00+00')
         RETURNING anomalia_id`,
          [
            readingId,
            `Obs ${states[i].legacy}`,
            states[i].legacy,
            isRes ? 'AJUSTE_LECTURA' : null,
            isRes ? 12.5 : null,
            isRes ? 'Note' : null,
            isRes ? scope.usuario_id : null,
            isRes ? new Date('2026-05-02T12:00:00Z') : null,
            isRes ? 'https://storage.local/photo.jpg' : null,
            states[i].legacy === 'DESCARTADA'
              ? new Date('2026-05-03T09:00:00Z')
              : null,
          ],
        );
        insertedIds.push(ins.rows[0].anomalia_id);
      }

      await client.query(backfill);

      const counts = await client.query<{ l: string; t: string }>(
        'SELECT (SELECT COUNT(*) FROM lectura_anomalia)::text AS l, (SELECT COUNT(*) FROM novedades_ordenes_trabajo)::text AS t',
      );
      assert.equal(counts.rows[0].l, counts.rows[0].t);

      const antiJoin = await client.query(
        `SELECT la.anomalia_id FROM lectura_anomalia la
       LEFT JOIN novedades_ordenes_trabajo n ON n.legacy_anomalia_id = la.anomalia_id WHERE n.novedad_id IS NULL`,
      );
      assert.equal(antiJoin.rows.length, 0);

      for (let i = 0; i < states.length; i++) {
        const id = insertedIds[i];
        const target = await client.query<{
          novedad_id: string;
          estado: string;
          tipo: string;
          observacion: string;
          resolucion_tipo: string | null;
          consumo_ajustado: string | null;
          foto_url: string | null;
          borrado_en: Date | null;
        }>(
          'SELECT * FROM novedades_ordenes_trabajo WHERE legacy_anomalia_id = $1',
          [id],
        );

        const row = target.rows[0];
        assert.equal(row.novedad_id, id);
        assert.equal(row.estado, states[i].target);
        assert.equal(row.tipo, 'FUGA');
        assert.equal(row.observacion, `Obs ${states[i].legacy}`);
        if (states[i].legacy === 'RESUELTA') {
          assert.equal(row.resolucion_tipo, 'AJUSTE_LECTURA');
          assert.equal(Number(row.consumo_ajustado), 12.5);
          assert.equal(row.foto_url, 'https://storage.local/photo.jpg');
        }
        if (states[i].legacy === 'DESCARTADA') {
          assert.ok(row.borrado_en !== null);
        }
      }

      // Sequence advancement check
      const seq = await client.query<{ novedad_id: string }>(
        `INSERT INTO novedades_ordenes_trabajo(orden_trabajo_id, tipo, estado)
       SELECT orden_trabajo_id, 'OTRO', 'OPEN' FROM ordenes_trabajo LIMIT 1 RETURNING novedad_id`,
      );
      assert.ok(
        Number(seq.rows[0].novedad_id) > Math.max(...insertedIds.map(Number)),
      );

      // Idempotency: re-running produces no new inserts
      await client.query(backfill);
      const countAfter = await client.query<{ c: string }>(
        'SELECT COUNT(*) AS c FROM novedades_ordenes_trabajo',
      );
      assert.equal(Number(countAfter.rows[0].c), Number(counts.rows[0].t) + 1);

      // Drift failure check
      await client.query(
        `UPDATE novedades_ordenes_trabajo SET observacion = 'Tampered' WHERE legacy_anomalia_id = $1`,
        [insertedIds[0]],
      );
      await assert.rejects(
        () => client.query(backfill),
        /Backfill blocked: \d+ existing target rows do not match legacy anomaly source values/,
      );
    });
  },
);
