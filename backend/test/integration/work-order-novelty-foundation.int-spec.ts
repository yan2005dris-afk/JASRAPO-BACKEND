import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client, type QueryResultRow } from 'pg';
import { assertExecutionHistoryMetadata } from './execution-history-metadata.assertions';
import { assertExecutionCapturedContent } from './execution-captured-content.assertions';

const image = process.env.B02_POSTGRES_IMAGE_ID;
const containerName = `b02-${process.pid}-${Math.random().toString(16).slice(2)}`;
let containerId = '';
let port = 0;
let client: Client | undefined;

type Novelty = {
  order?: number;
  execution?: number | null;
  reading?: number | null;
  reporter?: number;
  responsible?: number;
  type?: string;
};
const noveltySql = `insert into novedades_ordenes_trabajo
  (orden_trabajo_id, ejecucion_id, lectura_id, reportado_por_usuario_id,
   responsable_usuario_id, tipo, observacion, actualizado_en)
  values ($1, $2, $3, $4, $5, $6, $7, now())`;
const snapshotTables = [
  ['usuarios', 'usuario_id'],
  ['ordenes_trabajo', 'orden_trabajo_id'],
  ['lecturas', 'lectura_id'],
  ['ejecuciones_ordenes_trabajo', 'ejecucion_id'],
  ['lectura_anomalia', 'lectura_anomalia_id'],
] as const;

function docker(...args: string[]): string {
  return execFileSync('docker', args, {
    encoding: 'utf8',
    timeout: 5_000,
  }).trim();
}
function query(text: string, params?: unknown[]) {
  return client!.query(text, params);
}
async function insertNovelty(values: Novelty = {}) {
  await query(noveltySql, [
    values.order ?? 1,
    values.execution ?? null,
    values.reading ?? null,
    values.reporter ?? 10,
    values.responsible ?? 11,
    values.type ?? 'FUGA',
    'test',
  ]);
}
async function expectSqlState(
  action: () => Promise<unknown>,
  code: string,
  constraint?: string,
) {
  await query('savepoint expected_failure');
  await assert.rejects(
    action,
    (error: { code?: string; constraint?: string }) =>
      error.code === code && (!constraint || error.constraint === constraint),
  );
  await query('rollback to savepoint expected_failure');
  await query('release savepoint expected_failure');
}
async function transaction(action: () => Promise<void>) {
  await query('begin');
  try {
    await action();
    await query('rollback');
  } catch (error) {
    await query('rollback');
    throw error;
  }
}
async function snapshot(): Promise<QueryResultRow[][]> {
  const rows: QueryResultRow[][] = [];
  for (const [table, key] of snapshotTables)
    rows.push((await query(`select * from ${table} order by ${key}`)).rows);
  return rows;
}
async function waitForTcp(): Promise<Client> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = new Client({
      host: '127.0.0.1',
      port,
      user: 'postgres',
      password: 'test',
      database: 'b02',
      connectionTimeoutMillis: 2_000,
      query_timeout: 2_000,
    });
    candidate.on('error', () => undefined);
    try {
      await candidate.connect();
      await candidate.query('select 1');
      return candidate;
    } catch (error) {
      lastError = error;
      await candidate.end().catch(() => undefined);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
    }
  }
  throw new Error(`PostgreSQL TCP readiness failed: ${String(lastError)}`);
}

test.before(async () => {
  assert.match(image ?? '', /^sha256:[0-9a-f]{64}$/);
  assert.equal(JSON.parse(docker('image', 'inspect', image!))[0].Id, image);
  try {
    containerId = docker(
      'run',
      '--pull=never',
      '-d',
      '--name',
      containerName,
      '--label',
      `b02-owner=${containerName}`,
      '-p',
      '127.0.0.1::5432',
      '-e',
      'POSTGRES_PASSWORD=test',
      '-e',
      'POSTGRES_DB=b02',
      image!,
    );
  } catch (error) {
    try {
      docker('rm', '-f', '-v', containerName);
    } catch {}
    throw error;
  }
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = spawnSync(
      'docker',
      [
        'exec',
        containerId,
        'pg_isready',
        '-h',
        '127.0.0.1',
        '-p',
        '5432',
        '-U',
        'postgres',
        '-d',
        'b02',
      ],
      { timeout: 5_000 },
    );
    if (result.status === 0) break;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
  }
  port = Number(docker('port', containerId, '5432/tcp').split(':').pop());
  client = await waitForTcp();
  assert.match(
    (await query('show server_version_num')).rows[0].server_version_num,
    /^16/,
  );
  await query(`
    create table usuarios (usuario_id int primary key);
    create table ordenes_trabajo (orden_trabajo_id bigint primary key);
    create table lecturas (
      lectura_id bigint primary key, lectura_anterior numeric, lectura_actual numeric,
      consumo_calculado numeric, fecha timestamp, creado_en timestamp, actualizado_en timestamp
    );
    create table ejecuciones_ordenes_trabajo (
      ejecucion_id bigint primary key, orden_trabajo_id bigint not null unique,
      estado_sellos text, hay_fugas boolean, confirmacion_retiro_sello boolean,
      creado_en timestamp, actualizado_en timestamp not null, borrado_en timestamp,
      constraint ejecucion_orden_fk foreign key (orden_trabajo_id)
        references ordenes_trabajo (orden_trabajo_id) on delete cascade
    );
    create table lectura_anomalia (lectura_anomalia_id bigint primary key, lectura_id bigint);
    insert into usuarios values (10), (11);
    insert into ordenes_trabajo values (1), (2);
    insert into lecturas values (3, 100.25, 112.75, 12.5, '2026-01-02 03:04:05', '2026-01-02 03:04:05', '2026-01-02 03:05:05');
    insert into ejecuciones_ordenes_trabajo values (20, 1, 'INTACTO', true, null, '2026-01-02 03:04:05', '2026-01-02 03:05:05', null);
    insert into lectura_anomalia values (30, 3);
  `);
  const before = await snapshot();
  await query(
    readFileSync(
      resolve(
        __dirname,
        '../../prisma/migrations/20260830000002_add_order_novelty_foundation/migration.sql',
      ),
      'utf8',
    ),
  );
  assert.deepEqual(await snapshot(), before);
});

test('execution history metadata preserves legacy data and enforces its contract', () =>
  transaction(() =>
    assertExecutionHistoryMetadata(
      client!,
      readFileSync(
        resolve(
          __dirname,
          '../../prisma/migrations/20260830000003_add_execution_history_metadata/migration.sql',
        ),
        'utf8',
      ),
    ),
  ));

test('execution captured content migration preserves legacy nulls', () =>
  transaction(async () => {
    await client!.query(
      readFileSync(
        resolve(
          __dirname,
          '../../prisma/migrations/20260830000003_add_execution_history_metadata/migration.sql',
        ),
        'utf8',
      ),
    );
    await assertExecutionCapturedContent(
      client!,
      readFileSync(
        resolve(
          __dirname,
          '../../prisma/migrations/20260830000004_add_execution_captured_content/migration.sql',
        ),
        'utf8',
      ),
    );
  }));
test('multiple novelties share one order and execution', () =>
  transaction(async () => {
    await insertNovelty({ execution: 20, reading: 3 });
    await insertNovelty({ execution: 20, reading: 3 });
    assert.equal(
      (
        await query(
          'select count(*)::int count from novedades_ordenes_trabajo where ejecucion_id = 20',
        )
      ).rows[0].count,
      2,
    );
  }));
test('foreign keys and required fields', async (t) => {
  await t.test('mismatched composite', () =>
    transaction(() =>
      expectSqlState(
        () => insertNovelty({ order: 2, execution: 20 }),
        '23503',
        'novedades_ordenes_trabajo_ejecucion_id_orden_trabajo_id_fkey',
      ),
    ),
  );
  await t.test('missing optional parents', () =>
    transaction(async () => {
      await expectSqlState(
        () => insertNovelty({ reading: 999 }),
        '23503',
        'novedades_ordenes_trabajo_lectura_id_fkey',
      );
      await expectSqlState(
        () => insertNovelty({ execution: 999 }),
        '23503',
        'novedades_ordenes_trabajo_ejecucion_id_orden_trabajo_id_fkey',
      );
    }),
  );
  await t.test('required parents and nulls', () =>
    transaction(async () => {
      await expectSqlState(
        () => insertNovelty({ order: 999 }),
        '23503',
        'novedades_ordenes_trabajo_orden_trabajo_id_fkey',
      );
      await expectSqlState(
        () => insertNovelty({ reporter: 999 }),
        '23503',
        'novedades_ordenes_trabajo_reportado_por_usuario_id_fkey',
      );
      await expectSqlState(
        () => insertNovelty({ responsible: 999 }),
        '23503',
        'novedades_ordenes_trabajo_responsable_usuario_id_fkey',
      );
      await expectSqlState(
        () => query(noveltySql, [null, null, null, 10, 11, 'FUGA', 'x']),
        '23502',
      );
      await expectSqlState(
        () => query(noveltySql, [1, null, null, null, 11, 'FUGA', 'x']),
        '23502',
      );
      await expectSqlState(
        () => query(noveltySql, [1, null, null, 10, null, 'FUGA', 'x']),
        '23502',
      );
    }),
  );
});
test('nullable links default state and version', () =>
  transaction(async () => {
    await insertNovelty();
    assert.deepEqual(
      (
        await query(
          'select estado, version, lectura_id, ejecucion_id from novedades_ordenes_trabajo',
        )
      ).rows[0],
      { estado: 'PENDIENTE', version: 1, lectura_id: null, ejecucion_id: null },
    );
  }));
test('restricts every referenced parent', async (t) => {
  const cases = [
    [
      'order',
      'ordenes_trabajo',
      'orden_trabajo_id',
      2,
      { order: 2 },
      'novedades_ordenes_trabajo_orden_trabajo_id_fkey',
    ],
    [
      'execution',
      'ejecuciones_ordenes_trabajo',
      'ejecucion_id',
      20,
      { execution: 20 },
      'novedades_ordenes_trabajo_ejecucion_id_orden_trabajo_id_fkey',
    ],
    [
      'reading',
      'lecturas',
      'lectura_id',
      3,
      { reading: 3 },
      'novedades_ordenes_trabajo_lectura_id_fkey',
    ],
    [
      'reporter',
      'usuarios',
      'usuario_id',
      10,
      {},
      'novedades_ordenes_trabajo_reportado_por_usuario_id_fkey',
    ],
    [
      'responsible',
      'usuarios',
      'usuario_id',
      11,
      {},
      'novedades_ordenes_trabajo_responsable_usuario_id_fkey',
    ],
  ] as const;
  for (const [name, table, key, value, values, constraint] of cases)
    await t.test(name, () =>
      transaction(async () => {
        await insertNovelty(values);
        await expectSqlState(
          () => query(`delete from ${table} where ${key} = $1`, [value]),
          '23503',
          constraint,
        );
      }),
    );
});
test('all enum literals and invalid type/state', () =>
  transaction(async () => {
    for (const type of ['FUGA', 'MEDIDOR_DAÑADO', 'LECTURA_ERRONEA', 'OTRO'])
      await insertNovelty({ type });
    for (const state of ['PENDIENTE', 'EN_SEGUIMIENTO', 'RESUELTA'])
      await query(
        `insert into novedades_ordenes_trabajo (orden_trabajo_id, reportado_por_usuario_id, responsable_usuario_id, tipo, observacion, estado, actualizado_en) values (1, 10, 11, 'FUGA', 'x', $1, now())`,
        [state],
      );
    await expectSqlState(() => insertNovelty({ type: 'INVALID' }), '22P02');
    await expectSqlState(
      () =>
        query(
          `insert into novedades_ordenes_trabajo (orden_trabajo_id, reportado_por_usuario_id, responsable_usuario_id, tipo, observacion, estado, actualizado_en) values (1, 10, 11, 'FUGA', 'x', 'INVALID', now())`,
        ),
      '22P02',
    );
  }));
test('legacy uniqueness and conflict upsert preserve identity', () =>
  transaction(async () => {
    await expectSqlState(
      () =>
        query(
          'insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, estado_sellos, actualizado_en) values (21, 1, $1, now())',
          ['CAMBIADO'],
        ),
      '23505',
      'ejecuciones_ordenes_trabajo_orden_trabajo_id_key',
    );
    await query(
      'insert into ejecuciones_ordenes_trabajo (ejecucion_id, orden_trabajo_id, estado_sellos, actualizado_en) values (21, 1, $1, now()) on conflict (orden_trabajo_id) do update set estado_sellos = excluded.estado_sellos, actualizado_en = excluded.actualizado_en',
      ['CAMBIADO'],
    );
    const result = (
      await query(
        'select ejecucion_id, estado_sellos from ejecuciones_ordenes_trabajo where orden_trabajo_id = 1',
      )
    ).rows[0];
    assert.deepEqual(result, { ejecucion_id: '20', estado_sellos: 'CAMBIADO' });
  }));

test.after(async () => {
  let cleanupError: unknown;
  try {
    await client?.end();
  } catch (error) {
    cleanupError = error;
  }
  try {
    docker('rm', '-f', '-v', containerId || containerName);
  } catch (error) {
    cleanupError ??= error;
  }
  if (cleanupError) throw cleanupError;
});
