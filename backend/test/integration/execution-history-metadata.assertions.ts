import assert from 'node:assert/strict';
import type { Client } from 'pg';

type Sql = Pick<Client, 'query'>;
type Failure = { code?: string; constraint?: string };

async function expectSqlState(
  db: Sql,
  sql: string,
  values: readonly unknown[],
  code: string,
  constraint?: string,
) {
  await db.query('savepoint metadata_failure');
  await assert.rejects(
    db.query(sql, [...values]),
    (error: Failure) =>
      error.code === code && (!constraint || error.constraint === constraint),
  );
  await db.query('rollback to savepoint metadata_failure');
  await db.query('release savepoint metadata_failure');
}

const executionColumns = `ejecucion_id, orden_trabajo_id, estado_sellos, hay_fugas,
  confirmacion_retiro_sello, creado_en, actualizado_en, borrado_en`;
const tables = [
  ['usuarios', 'usuario_id'],
  ['ordenes_trabajo', 'orden_trabajo_id'],
  ['lecturas', 'lectura_id'],
  ['ejecuciones_ordenes_trabajo', 'ejecucion_id'],
  ['lectura_anomalia', 'lectura_anomalia_id'],
  ['novedades_ordenes_trabajo', 'novedad_id'],
] as const;
const metadataColumns =
  'estado, creado_por_usuario_id, propietario_usuario_id, enviado_por_usuario_id, enviado_en, cancelado_en, version';
const lifecycleCases = [
  ...[
    'creado_por_usuario_id',
    'propietario_usuario_id',
    'enviado_por_usuario_id',
  ].map((column) => [20, column, 10]),
  ...['enviado_en', 'cancelado_en'].map((column) => [
    20,
    column,
    new Date('2026-01-01T00:00:00.000Z'),
  ]),
  ...['creado_por_usuario_id', 'propietario_usuario_id'].map((column) => [
    21,
    column,
    null,
  ]),
  ...['enviado_por_usuario_id', 'enviado_en', 'cancelado_en'].map((column) => [
    21,
    column,
    column.endsWith('_en') ? new Date('2026-01-01T00:00:00.000Z') : 10,
  ]),
  ...[
    'creado_por_usuario_id',
    'propietario_usuario_id',
    'enviado_por_usuario_id',
    'enviado_en',
  ].map((column) => [22, column, column.endsWith('_en') ? null : null]),
  [22, 'cancelado_en', new Date('2026-01-01T00:00:00.000Z')],
  ...['creado_por_usuario_id', 'propietario_usuario_id'].map((column) => [
    23,
    column,
    null,
  ]),
  [23, 'cancelado_en', null],
  [23, 'enviado_por_usuario_id', 10],
  [23, 'enviado_en', new Date('2026-01-01T00:00:00.000Z')],
] as const;

export async function assertExecutionHistoryMetadata(
  db: Sql,
  migrationSql: string,
) {
  await db.query(`insert into novedades_ordenes_trabajo
    (orden_trabajo_id, ejecucion_id, lectura_id, reportado_por_usuario_id, responsable_usuario_id, tipo, observacion, actualizado_en)
    select 1,20,3,10,11,'FUGA','metadata fixture',now()
    where not exists (select 1 from novedades_ordenes_trabajo where ejecucion_id = 20)`);
  const before: Record<string, unknown[]> = {};
  for (const [table, key] of tables) {
    const columns =
      table === 'ejecuciones_ordenes_trabajo' ? executionColumns : '*';
    before[table] = (
      await db.query(`select ${columns} from ${table} order by ${key}`)
    ).rows;
  }
  await db.query(migrationSql);
  for (const [table, key] of tables) {
    const columns =
      table === 'ejecuciones_ordenes_trabajo' ? executionColumns : '*';
    assert.deepEqual(
      (await db.query(`select ${columns} from ${table} order by ${key}`)).rows,
      before[table],
      `migration changed ${table}`,
    );
  }
  assert.deepEqual(
    (
      await db.query(
        `select ${metadataColumns} from ejecuciones_ordenes_trabajo where ejecucion_id = 20`,
      )
    ).rows[0],
    {
      estado: 'LEGACY_UNKNOWN',
      creado_por_usuario_id: null,
      propietario_usuario_id: null,
      enviado_por_usuario_id: null,
      enviado_en: null,
      cancelado_en: null,
      version: 1,
    },
  );

  await db.query(
    'insert into usuarios (usuario_id) values (21),(22),(23),(30),(31),(32)',
  );
  await db.query(
    'insert into ordenes_trabajo (orden_trabajo_id) values (3),(4),(5)',
  );
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, estado, creado_por_usuario_id, propietario_usuario_id, actualizado_en) values (21,2,'DRAFT',21,22,now())`,
  );
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, estado, creado_por_usuario_id, propietario_usuario_id, enviado_por_usuario_id, enviado_en, actualizado_en) values (22,3,'SUBMITTED',30,31,32,now(),now())`,
  );
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, estado, creado_por_usuario_id, propietario_usuario_id, cancelado_en, actualizado_en) values (23,4,'CANCELED',10,11,now(),now())`,
  );

  for (const [column, user, constraint] of [
    [
      'creado_por_usuario_id',
      30,
      'ejecuciones_ordenes_trabajo_creado_por_usuario_id_fkey',
    ],
    [
      'propietario_usuario_id',
      31,
      'ejecuciones_ordenes_trabajo_propietario_usuario_id_fkey',
    ],
    [
      'enviado_por_usuario_id',
      32,
      'ejecuciones_ordenes_trabajo_enviado_por_usuario_id_fkey',
    ],
  ] as const) {
    await expectSqlState(
      db,
      `update ejecuciones_ordenes_trabajo set ${column} = $1 where ejecucion_id = 22`,
      [999],
      '23503',
      constraint,
    );
    await expectSqlState(
      db,
      `delete from usuarios where usuario_id = ${user}`,
      [],
      '23503',
      constraint,
    );
  }
  for (const [sql, values, code, constraint] of [
    [
      'update ejecuciones_ordenes_trabajo set version = $1 where ejecucion_id = 21',
      [0],
      '23514',
      'ejecuciones_ordenes_trabajo_version_check',
    ],
    [
      'update ejecuciones_ordenes_trabajo set version = $1 where ejecucion_id = 21',
      [-1],
      '23514',
      'ejecuciones_ordenes_trabajo_version_check',
    ],
    ...([
      ['creado_por_usuario_id', 30],
      ['propietario_usuario_id', 31],
      ['enviado_por_usuario_id', 32],
    ].flatMap(([column, user]) => [
      [
        `update ejecuciones_ordenes_trabajo set ${column} = $1 where ejecucion_id = 22`,
        [0],
        '23514',
        'ejecuciones_ordenes_trabajo_actor_positive_check',
      ],
      [
        `update ejecuciones_ordenes_trabajo set ${column} = $1 where ejecucion_id = 22`,
        [-1],
        '23514',
        'ejecuciones_ordenes_trabajo_actor_positive_check',
      ],
    ]) as [string, number[], string, string][]),
    [
      'update ejecuciones_ordenes_trabajo set estado = $1 where ejecucion_id = 21',
      ['SUBMITTED'],
      '23514',
      'ejecuciones_ordenes_trabajo_lifecycle_check',
    ],
  ] as const)
    await expectSqlState(db, sql, values, code, constraint);
  await expectSqlState(
    db,
    'update ejecuciones_ordenes_trabajo set estado = $1 where ejecucion_id = 21',
    ['NOT_A_STATE'],
    '22P02',
  );
  await expectSqlState(
    db,
    'update ejecuciones_ordenes_trabajo set estado = $1, version = $2 where ejecucion_id = 21',
    [null, 1],
    '23502',
  );
  await expectSqlState(
    db,
    'update ejecuciones_ordenes_trabajo set estado = $1, version = $2 where ejecucion_id = 21',
    ['DRAFT', null],
    '23502',
  );
  for (const [id, column, value] of lifecycleCases)
    await expectSqlState(
      db,
      `update ejecuciones_ordenes_trabajo set ${column} = $1 where ejecucion_id = ${id}`,
      [value],
      '23514',
      'ejecuciones_ordenes_trabajo_lifecycle_check',
    );

  await db.query(
    'insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, actualizado_en) values (99,5,now())',
  );
  assert.deepEqual(
    (
      await db.query(
        `select ${metadataColumns} from ejecuciones_ordenes_trabajo where ejecucion_id = 99`,
      )
    ).rows[0],
    {
      estado: 'LEGACY_UNKNOWN',
      creado_por_usuario_id: null,
      propietario_usuario_id: null,
      enviado_por_usuario_id: null,
      enviado_en: null,
      cancelado_en: null,
      version: 1,
    },
  );
  const old = (
    await db.query(
      `select ${metadataColumns} from ejecuciones_ordenes_trabajo where ejecucion_id = 20`,
    )
  ).rows[0];
  await db.query(
    `insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, estado_sellos, actualizado_en) values (100,1,'new-seal',now()) on conflict (orden_trabajo_id) do update set estado_sellos = excluded.estado_sellos`,
  );
  assert.equal(
    (
      await db.query(
        'select ejecucion_id, orden_trabajo_id, estado_sellos from ejecuciones_ordenes_trabajo where orden_trabajo_id = 1',
      )
    ).rows[0].ejecucion_id,
    '20',
  );
  assert.equal(
    (
      await db.query(
        'select estado_sellos from ejecuciones_ordenes_trabajo where ejecucion_id = 20',
      )
    ).rows[0].estado_sellos,
    'new-seal',
  );
  assert.deepEqual(
    (
      await db.query(
        `select ${metadataColumns} from ejecuciones_ordenes_trabajo where ejecucion_id = 20`,
      )
    ).rows[0],
    old,
  );
  assert.equal(
    (await db.query('delete from ordenes_trabajo where orden_trabajo_id = 5'))
      .rowCount,
    1,
  );
  assert.equal(
    (
      await db.query(
        'select 1 from ejecuciones_ordenes_trabajo where ejecucion_id = 99',
      )
    ).rowCount,
    0,
  );
  await expectSqlState(
    db,
    'insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, actualizado_en) values ($1,$2,now())',
    [100, 1],
    '23505',
    'ejecuciones_ordenes_trabajo_orden_trabajo_id_key',
  );
}
