import assert from 'node:assert/strict';
import type { QueryResultRow } from 'pg';

type Db = {
  query(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: QueryResultRow[] }>;
};
const fields = [
  'lectura_snapshot_id',
  'lectura_snapshot_anterior',
  'lectura_snapshot_actual',
  'lectura_snapshot_consumo',
  'lectura_snapshot_fecha',
  'lectura_snapshot_inicial',
  'lectura_snapshot_medidor_id',
  'lectura_snapshot_periodo_id',
] as const;
const constraint = 'ejecucion_lectura_snapshot_all_or_none_chk';
const populated = [
  3n,
  '9007199254740993.123456789',
  '9007199254740994.123456789',
  '1.23e-19',
  '2026-02-03 04:05:06.123',
  false,
  9007199254740995n,
  202602,
] as const;
const columns = fields.join(', '),
  nulls = fields.map(() => 'null').join(', ');
const values = fields.map((_, i) => `$${i + 1}`).join(', ');
const empty = Object.fromEntries(fields.map((field) => [field, null]));
async function readExecution(db: Db, executionId: number) {
  const rows = (
    await db.query(
      `select lectura_snapshot_id, lectura_snapshot_anterior, lectura_snapshot_actual, lectura_snapshot_consumo, to_char(lectura_snapshot_fecha,'YYYY-MM-DD HH24:MI:SS.MS') lectura_snapshot_fecha, lectura_snapshot_inicial, lectura_snapshot_medidor_id, lectura_snapshot_periodo_id from ejecuciones_ordenes_trabajo where ejecucion_id=$1`,
      [executionId],
    )
  ).rows;
  assert.equal(rows.length, 1);
  return rows[0];
}
async function rejected(
  db: Db,
  action: () => Promise<unknown>,
  code = '23514',
  name = constraint,
) {
  await db.query('savepoint snapshot_failure');
  await assert.rejects(
    action,
    (error: { code?: string; constraint?: string }) =>
      error.code === code && error.constraint === name,
  );
  await db.query('rollback to savepoint snapshot_failure');
  await db.query('release savepoint snapshot_failure');
}
const tables = [
  ['usuarios', 'usuario_id'],
  ['ordenes_trabajo', 'orden_trabajo_id'],
  ['lecturas', 'lectura_id'],
  ['lectura_anomalia', 'lectura_anomalia_id'],
  ['novedades_ordenes_trabajo', 'novedad_id'],
  ['ejecuciones_ordenes_trabajo', 'ejecucion_id'],
] as const;
async function oldRows(db: Db) {
  const result: Record<string, Record<string, unknown>[]> = {};
  for (const [table, key] of tables)
    result[table] = (
      await db.query(`select * from ${table} order by ${key}`)
    ).rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).filter(
          ([name]) => !fields.includes(name as (typeof fields)[number]),
        ),
      ),
    );
  return result;
}
export async function assertExecutionReadingSnapshot(
  db: Db,
  migrationSql: string,
) {
  await db.query(`insert into ordenes_trabajo values (5);
    insert into ejecuciones_ordenes_trabajo (ejecucion_id,orden_trabajo_id,estado,creado_por_usuario_id,propietario_usuario_id,enviado_por_usuario_id,enviado_en,actualizado_en) values (22,5,'SUBMITTED',10,11,10,'2026-02-01 02:03:04',now());
    insert into novedades_ordenes_trabajo (orden_trabajo_id,ejecucion_id,lectura_id,reportado_por_usuario_id,responsable_usuario_id,tipo,observacion,actualizado_en) values (5,22,3,10,11,'FUGA','B03c representative capture',now());
        update ejecuciones_ordenes_trabajo set resultado_observacion='captured',evidencia_foto_url='objects/22.webp' where ejecucion_id=22;`);
  const before = await oldRows(db);
  await db.query(migrationSql);
  assert.deepEqual(await oldRows(db), before);
  assert.deepEqual(await readExecution(db, 20), empty);
  const definition = (
    await db.query(
      `select column_name,data_type,udt_name,is_nullable,column_default,numeric_precision,numeric_scale,datetime_precision from information_schema.columns where table_name='ejecuciones_ordenes_trabajo' and column_name=any($1) order by array_position($1,column_name)`,
      [fields],
    )
  ).rows as Record<string, unknown>[];
  assert.equal(definition.length, 8);
  assert.deepEqual(
    definition.map((r) => r.udt_name),
    [
      'int8',
      'numeric',
      'numeric',
      'numeric',
      'timestamp',
      'bool',
      'int8',
      'int4',
    ],
  );
  assert.ok(
    definition.every(
      (r) => r.is_nullable === 'YES' && r.column_default === null,
    ),
  );
  assert.ok(
    definition
      .slice(1, 4)
      .every((r) => r.numeric_precision === null && r.numeric_scale === null),
  );
  assert.equal(definition[4].datetime_precision, 3);
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id,orden_trabajo_id,actualizado_en) values (31,2,now())`,
  );
  assert.deepEqual(await readExecution(db, 31), empty);
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id,orden_trabajo_id,${columns},actualizado_en) values (32,3,${values},now())`,
    populated,
  );
  const original = await readExecution(db, 32);
  assert.equal(original.lectura_snapshot_id, '3');
  assert.equal(original.lectura_snapshot_medidor_id, populated[6].toString());
  assert.equal(original.lectura_snapshot_periodo_id, 202602);
  assert.equal(original.lectura_snapshot_consumo, '0.000000000000000000123');
  assert.equal(original.lectura_snapshot_anterior, populated[1]);
  assert.equal(original.lectura_snapshot_actual, populated[2]);
  assert.equal(original.lectura_snapshot_inicial, false);
  assert.equal(original.lectura_snapshot_fecha, '2026-02-03 04:05:06.123');
  await db.query('insert into ordenes_trabajo (orden_trabajo_id) values (6)');
  assert.deepEqual(
    (
      await db.query(`select o.orden_trabajo_id, e.ejecucion_id
        from ordenes_trabajo o
        left join ejecuciones_ordenes_trabajo e using (orden_trabajo_id)
        where o.orden_trabajo_id=6`)
    ).rows,
    [{ orden_trabajo_id: '6', ejecucion_id: null }],
  );
  for (const [i] of fields.entries())
    await rejected(db, () =>
      db.query(
        `insert into ejecuciones_ordenes_trabajo (ejecucion_id,orden_trabajo_id,${columns},actualizado_en) values (40,6,${fields.map((_, j) => `$${j + 1}`).join(',')},now())`,
        populated.map((v, j) => (i === j ? null : v)),
      ),
    );
  for (const field of fields)
    await rejected(db, () =>
      db.query(
        `update ejecuciones_ordenes_trabajo set ${field}=null where ejecucion_id=32`,
      ),
    );
  await db.query(
    `update ejecuciones_ordenes_trabajo set (${columns})=(${values}) where ejecucion_id=32`,
    populated,
  );
  assert.deepEqual(await readExecution(db, 32), original);
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id,orden_trabajo_id,actualizado_en) values (33,3,now()) on conflict (orden_trabajo_id) do update set estado_sellos='UPserted'`,
  );
  const conflict = (
    await db.query(
      `select ejecucion_id,estado_sellos from ejecuciones_ordenes_trabajo where orden_trabajo_id=3`,
    )
  ).rows[0];
  assert.equal(conflict.ejecucion_id, '32');
  assert.equal(conflict.estado_sellos, 'UPserted');
  assert.deepEqual(await readExecution(db, 32), original);
  const source = (await db.query('select * from lecturas where lectura_id=3'))
    .rows[0];
  await db.query(
    'update lecturas set lectura_actual=999.75,consumo_calculado=887.25,fecha=$1 where lectura_id=3',
    ['2030-04-05 06:07:08.999'],
  );
  assert.notDeepEqual(
    (await db.query('select * from lecturas where lectura_id=3')).rows[0],
    source,
  );
  assert.deepEqual(await readExecution(db, 32), original);
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id,orden_trabajo_id,${columns},actualizado_en) values (41,4,${nulls},now())`,
  );
  assert.deepEqual(await readExecution(db, 41), empty);
  const zero = [
    4n,
    0,
    0,
    0,
    '2026-02-04 00:00:00.000',
    false,
    77n,
    202602,
  ] as const;
  await db.query(
    `update ejecuciones_ordenes_trabajo set (${columns})=(${values}) where ejecucion_id=41`,
    zero,
  );
  assert.deepEqual(await readExecution(db, 41), {
    lectura_snapshot_id: '4',
    lectura_snapshot_anterior: '0',
    lectura_snapshot_actual: '0',
    lectura_snapshot_consumo: '0',
    lectura_snapshot_fecha: '2026-02-04 00:00:00.000',
    lectura_snapshot_inicial: false,
    lectura_snapshot_medidor_id: '77',
    lectura_snapshot_periodo_id: 202602,
  });
  await db.query(
    `update ejecuciones_ordenes_trabajo set (${columns})=(${nulls}) where ejecucion_id=41`,
  );
  assert.deepEqual(await readExecution(db, 41), empty);
  const indexes = (
    await db.query(`
    select array_agg(a.attname::text order by k.ordinality) as columns
    from pg_index i
    cross join lateral unnest(i.indkey) with ordinality k(attnum, ordinality)
    join pg_attribute a on a.attrelid=i.indrelid and a.attnum=k.attnum
    where i.indrelid='ejecuciones_ordenes_trabajo'::regclass and i.indisunique
    group by i.indexrelid`)
  ).rows;
  for (const expected of [
    ['orden_trabajo_id'],
    ['ejecucion_id', 'orden_trabajo_id'],
  ]) {
    assert.ok(
      indexes.some(
        ({ columns }) =>
          Array.isArray(columns) &&
          columns.length === expected.length &&
          columns.every((column, index) => column === expected[index]),
      ),
    );
  }
  await rejected(
    db,
    () =>
      db.query(
        `insert into ejecuciones_ordenes_trabajo (ejecucion_id,orden_trabajo_id,actualizado_en) values (42,5,now())`,
      ),
    '23505',
    'ejecuciones_ordenes_trabajo_orden_trabajo_id_key',
  );
  await rejected(
    db,
    () =>
      db.query(
        `insert into novedades_ordenes_trabajo (orden_trabajo_id,ejecucion_id,lectura_id,reportado_por_usuario_id,responsable_usuario_id,tipo,observacion,actualizado_en) values (1,22,3,10,11,'FUGA','bad',now())`,
      ),
    '23503',
    'novedades_ordenes_trabajo_ejecucion_id_orden_trabajo_id_fkey',
  );
  await rejected(
    db,
    () => db.query('delete from ordenes_trabajo where orden_trabajo_id=5'),
    '23503',
    'novedades_ordenes_trabajo_orden_trabajo_id_fkey',
  );
  await db.query('delete from novedades_ordenes_trabajo where ejecucion_id=22');
  await db.query('delete from ordenes_trabajo where orden_trabajo_id=5');
  assert.equal(
    (
      await db.query(
        'select count(*)::int count from ejecuciones_ordenes_trabajo where ejecucion_id=22',
      )
    ).rows[0].count,
    0,
  );
  assert.equal(
    (
      await db.query(
        'select count(*)::int count from novedades_ordenes_trabajo where ejecucion_id=22',
      )
    ).rows[0].count,
    0,
  );
}
