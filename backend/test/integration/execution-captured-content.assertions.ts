import assert from 'node:assert/strict';
import type { Client } from 'pg';

type Sql = Pick<Client, 'query'>;
type Row = Record<string, unknown>;

const tables = [
  ['usuarios', 'usuario_id'],
  ['ordenes_trabajo', 'orden_trabajo_id'],
  ['lecturas', 'lectura_id'],
  ['lectura_anomalia', 'lectura_anomalia_id'],
  ['novedades_ordenes_trabajo', 'novedad_id'],
  ['ejecuciones_ordenes_trabajo', 'ejecucion_id'],
] as const;

async function snapshot(db: Sql): Promise<Row[][]> {
  const result: Row[][] = [];
  for (const [table, key] of tables) {
    const columns =
      table === 'ejecuciones_ordenes_trabajo'
        ? `ejecucion_id, orden_trabajo_id, estado_sellos, hay_fugas,
           confirmacion_retiro_sello, creado_en, actualizado_en, borrado_en,
           estado, creado_por_usuario_id, propietario_usuario_id,
           enviado_por_usuario_id, enviado_en, cancelado_en, version`
        : '*';
    result.push(
      (await db.query(`select ${columns} from ${table} order by ${key}`)).rows,
    );
  }
  return result;
}

async function expectSqlState(
  db: Sql,
  action: () => Promise<unknown>,
  code: string,
  constraint?: string,
) {
  await db.query('savepoint captured_failure');
  await assert.rejects(
    action,
    (error: { code?: string; constraint?: string }) =>
      error.code === code && (!constraint || error.constraint === constraint),
  );
  await db.query('rollback to savepoint captured_failure');
  await db.query('release savepoint captured_failure');
}

export async function assertExecutionCapturedContent(
  db: Sql,
  migrationSql: string,
) {
  await db.query(`
    alter table ordenes_trabajo add column resultado_observacion text;
    alter table ordenes_trabajo add column evidencia_foto_url text;
    update ordenes_trabajo set resultado_observacion = 'original order', evidencia_foto_url = 'original/photo' where orden_trabajo_id = 1;
    insert into ordenes_trabajo (orden_trabajo_id) values (3);
    insert into ejecuciones_ordenes_trabajo
      (ejecucion_id, orden_trabajo_id, estado, creado_por_usuario_id, propietario_usuario_id,
       enviado_por_usuario_id, enviado_en, actualizado_en)
    values (22, 3, 'SUBMITTED', 10, 11, 10, '2026-01-03 04:05:06', '2026-01-03 04:05:06');
    insert into novedades_ordenes_trabajo
      (orden_trabajo_id, ejecucion_id, reportado_por_usuario_id, responsable_usuario_id, tipo, observacion, actualizado_en)
    values (3, 22, 10, 11, 'FUGA', 'B03b representative novelty', now());
  `);

  const before = await snapshot(db);
  await db.query(migrationSql);
  assert.deepEqual(
    await snapshot(db),
    before,
    'B03c changed pre-existing values',
  );

  const legacy = (
    await db.query(
      `select estado, creado_por_usuario_id, propietario_usuario_id, enviado_por_usuario_id,
            enviado_en, cancelado_en, version, resultado_observacion, evidencia_foto_url
     from ejecuciones_ordenes_trabajo where ejecucion_id = 20`,
    )
  ).rows[0];
  assert.deepEqual(legacy, {
    estado: 'LEGACY_UNKNOWN',
    creado_por_usuario_id: null,
    propietario_usuario_id: null,
    enviado_por_usuario_id: null,
    enviado_en: null,
    cancelado_en: null,
    version: 1,
    resultado_observacion: null,
    evidencia_foto_url: null,
  });
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, actualizado_en)
     values (21, 2, now())`,
  );
  assert.deepEqual(
    (
      await db.query(
        `select estado, creado_por_usuario_id, propietario_usuario_id, enviado_por_usuario_id,
            enviado_en, cancelado_en, version, resultado_observacion, evidencia_foto_url
     from ejecuciones_ordenes_trabajo where ejecucion_id = 21`,
      )
    ).rows[0],
    legacy,
  );

  await db.query(
    `update ejecuciones_ordenes_trabajo set resultado_observacion = $1, evidencia_foto_url = $2 where ejecucion_id = 20`,
    ['Unicode ✓\nmultiline observation', 'objects/work-orders/1/photo.webp'],
  );
  assert.deepEqual(
    (
      await db.query(
        `select resultado_observacion, evidencia_foto_url from ejecuciones_ordenes_trabajo where ejecucion_id = 20`,
      )
    ).rows[0],
    {
      resultado_observacion: 'Unicode ✓\nmultiline observation',
      evidencia_foto_url: 'objects/work-orders/1/photo.webp',
    },
  );
  await db.query(
    'update ejecuciones_ordenes_trabajo set resultado_observacion = null, evidencia_foto_url = null where ejecucion_id = 21',
  );
  assert.deepEqual(
    (
      await db.query(
        `select resultado_observacion, evidencia_foto_url from ejecuciones_ordenes_trabajo where ejecucion_id = 21`,
      )
    ).rows[0],
    { resultado_observacion: null, evidencia_foto_url: null },
  );

  await db.query(
    `update ordenes_trabajo set resultado_observacion = 'changed order', evidencia_foto_url = 'changed/photo' where orden_trabajo_id = 1`,
  );
  assert.deepEqual(
    (
      await db.query(
        `select resultado_observacion, evidencia_foto_url from ejecuciones_ordenes_trabajo where ejecucion_id = 20`,
      )
    ).rows[0],
    {
      resultado_observacion: 'Unicode ✓\nmultiline observation',
      evidencia_foto_url: 'objects/work-orders/1/photo.webp',
    },
  );

  await db.query(`insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, estado_sellos, actualizado_en)
    values (200, 1, 'upserted', now()) on conflict (orden_trabajo_id) do update set estado_sellos = excluded.estado_sellos`);
  assert.deepEqual(
    (
      await db.query(
        `select ejecucion_id, estado_sellos, resultado_observacion, evidencia_foto_url from ejecuciones_ordenes_trabajo where orden_trabajo_id = 1`,
      )
    ).rows[0],
    {
      ejecucion_id: '20',
      estado_sellos: 'upserted',
      resultado_observacion: 'Unicode ✓\nmultiline observation',
      evidencia_foto_url: 'objects/work-orders/1/photo.webp',
    },
  );

  const indexes = (
    await db.query(`select i.relname, array_agg(a.attname::text order by k.ordinality) as columns
    from pg_class t join pg_index ix on ix.indrelid = t.oid and ix.indisunique
    join pg_class i on i.oid = ix.indexrelid
    join unnest(ix.indkey) with ordinality k(attnum, ordinality) on true
    join pg_attribute a on a.attrelid = t.oid and a.attnum = k.attnum
    where t.relname = 'ejecuciones_ordenes_trabajo' group by i.relname`)
  ).rows;
  const exactColumns = (row: Row, expected: readonly string[]) =>
    Array.isArray(row.columns) &&
    row.columns.length === expected.length &&
    row.columns.every((column, index) => column === expected[index]);
  assert.ok(indexes.some((row) => exactColumns(row, ['orden_trabajo_id'])));
  assert.ok(
    indexes.some((row) =>
      exactColumns(row, ['ejecucion_id', 'orden_trabajo_id']),
    ),
  );
  await expectSqlState(
    db,
    () =>
      db.query(
        `insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, actualizado_en) values (201, 1, now())`,
      ),
    '23505',
    'ejecuciones_ordenes_trabajo_orden_trabajo_id_key',
  );

  await db.query('insert into ordenes_trabajo (orden_trabajo_id) values (99)');
  await db.query(
    'insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, actualizado_en) values (299, 99, now())',
  );
  assert.equal(
    (await db.query('delete from ordenes_trabajo where orden_trabajo_id = 99'))
      .rowCount,
    1,
  );
  assert.equal(
    (
      await db.query(
        'select 1 from ejecuciones_ordenes_trabajo where ejecucion_id = 299',
      )
    ).rowCount,
    0,
  );
}
