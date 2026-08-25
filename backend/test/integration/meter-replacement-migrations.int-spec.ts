import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { after, before, describe, it } from 'node:test';

interface ChainFixture {
  communityId: number;
  periodId: number;
  contractId: string;
  replacementAId: string;
  replacementBId: string;
}

void describe(
  'meter replacement forward migrations',
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
        const connectionString = container.getConnectionUri();
        execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: connectionString },
          stdio: 'pipe',
        });
        client = new Client({ connectionString });
        await client.connect();
        await client.query(`
      INSERT INTO catalogo_impuestos(codigo, nombre, activo, created_at, updated_at)
      VALUES ('99', 'Test tax', true, now(), now());
      INSERT INTO catalogo_tarifas_impuesto(
        impuesto_id, codigo_porcentaje, descripcion, porcentaje,
        vigente_desde, activo, created_at, updated_at
      ) VALUES ((SELECT id FROM catalogo_impuestos WHERE codigo = '99'), '0', 'Zero', 0,
        '2026-01-01', true, now(), now());
      INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro,
        tarifa_impuesto_id, creado_en, actualizado_en)
      SELECT code, code, code, 0, kind::"TipoRubro",
        (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'), now(), now()
      FROM (VALUES ('001', 'VARIABLE'), ('002', 'FIJO'), ('003', 'MULTA'), ('004', 'OTRO')) v(code, kind);
      INSERT INTO emisores(ruc, razon_social, direccion_matriz, created_at, updated_at)
      VALUES ('9999999999001', 'Test issuer', 'Test', now(), now());
      INSERT INTO establecimientos(emisor_id, codigo, direccion, created_at)
      VALUES ((SELECT id FROM emisores WHERE ruc = '9999999999001'), '001', 'Test', now());
      INSERT INTO puntos_emision(establecimiento_id, codigo, created_at)
      VALUES ((SELECT id FROM establecimientos WHERE codigo = '001'), '001', now());
      INSERT INTO parametro_tasa_interes(tasa, activo, vigente_desde, creado_en, actualizado_en)
      VALUES (0.01, true, '2026-01-01', now(), now());
    `);
      },
      { timeout: 180_000 },
    );

    after(async () => {
      await client?.end();
      await container?.stop();
    });

    async function seedChain(params: {
      prefix: string;
      treatmentA: 'FACTURAR_PERIODO_ACTUAL' | 'DIFERIR_SIGUIENTE_PERIODO';
      treatmentB: 'FACTURAR_PERIODO_ACTUAL' | 'DIFERIR_SIGUIENTE_PERIODO';
      bConsumption?: number;
      cOriginConsumption?: number;
      cDestinationConsumption?: number;
    }): Promise<ChainFixture> {
      const bConsumption = params.bConsumption ?? 20;
      const cOriginConsumption = params.cOriginConsumption ?? 10;
      const cDestinationConsumption = params.cDestinationConsumption ?? 5;
      const scopeResult = await client.query<{
        comunidad_id: number;
        periodo_id: number;
        usuario_id: number;
        contrato_id: string;
      }>(
        `WITH community AS (
         INSERT INTO comunidades(nombre, codigo, porcentaje_tasa_seguridad, creado_en, actualizado_en)
         VALUES ($1, $2, 0, now(), now()) RETURNING comunidad_id
       ), period AS (
         INSERT INTO periodos(nombre, fecha_inicio, fecha_fin, fecha_vencimiento, creado_en, actualizado_en)
         VALUES ($3, '2026-01-01', '2026-12-31', '2027-01-15', now(), now())
         RETURNING periodo_id
       ), requester AS (
         INSERT INTO usuarios(email, contrasenia, creado_en, actualizado_en)
         VALUES ($4, 'not-used', now(), now()) RETURNING usuario_id
       ), tariff AS (
         INSERT INTO categoria_tarifa(nombre, consumo_minimo_mensual, activo, creado_en, actualizado_en)
         VALUES ($5, 0, true, now(), now()) RETURNING categoria_tarifa_id
       ), tariff_fijo AS (
         INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro,
           tarifa_impuesto_id, categoria_tarifa_id, creado_en, actualizado_en)
         SELECT 'FIJO-' || $2, 'Cargo Fijo', 'Cargo Fijo', 4, 'FIJO'::"TipoRubro",
           (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'),
           tariff.categoria_tarifa_id, now(), now()
         FROM tariff
       ), tariff_var AS (
         INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro,
           tarifa_impuesto_id, categoria_tarifa_id, creado_en, actualizado_en)
         SELECT 'VAR-' || $2, 'Consumo Agua', 'Consumo Agua', 5, 'VARIABLE'::"TipoRubro",
           (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'),
           tariff.categoria_tarifa_id, now(), now()
         FROM tariff
       ), customer AS (
         INSERT INTO clientes(apellidos, identificacion, nombres, creado_en, actualizado_en)
         VALUES ('Test', $6, 'Billing', now(), now()) RETURNING cliente_id
       ), contract AS (
         INSERT INTO contratos(cliente_id, categoria_tarifa_id, numero_guia,
           direccion_suministro, estado, comunidad_id, creado_en, actualizado_en)
         SELECT customer.cliente_id, tariff.categoria_tarifa_id, $7, 'Test',
           'ACTIVO', community.comunidad_id, now(), now()
         FROM customer, tariff, community RETURNING contrato_id
       )
       SELECT community.comunidad_id, period.periodo_id, requester.usuario_id,
         contract.contrato_id FROM community, period, requester, contract`,
        [
          `${params.prefix} community`,
          `${params.prefix}-COMM`,
          `${params.prefix}-2026`,
          `${params.prefix}@test.local`,
          `${params.prefix} tariff`,
          `${params.prefix}-CUSTOMER`,
          `${params.prefix}-GUIDE`,
        ],
      );
      const scope = scopeResult.rows[0];

      const histories = await client.query<{
        history_a: string;
        history_b: string;
        history_c: string;
      }>(
        `WITH meters AS (
         INSERT INTO medidores(marca, modelo, serie, estado, creado_en, actualizado_en)
         VALUES ('T', 'T', $3, 'BODEGA', now(), now()),
                ('T', 'T', $4, 'BODEGA', now(), now()),
                ('T', 'T', $5, 'INSTALADO', now(), now())
         RETURNING medidor_id, serie
       ), a AS (
         INSERT INTO historial_medidores(medidor_id, contrato_id, fecha_desde, fecha_hasta,
           lectura_inicial_historial, lectura_final_historial, creado_en, actualizado_en)
         SELECT medidor_id, $1, '2026-01-01', '2026-08-10', 0, 15, now(), now()
         FROM meters WHERE serie = $3 RETURNING historial_id
       ), b AS (
         INSERT INTO historial_medidores(medidor_id, contrato_id, fecha_desde, fecha_hasta,
           lectura_inicial_historial, lectura_final_historial, creado_en, actualizado_en)
         SELECT medidor_id, $1, '2026-08-10', '2026-08-20', 0, $6, now(), now()
         FROM meters WHERE serie = $4 RETURNING historial_id
       ), c AS (
         INSERT INTO historial_medidores(medidor_id, contrato_id, fecha_desde,
           lectura_inicial_historial, creado_en, actualizado_en)
         SELECT medidor_id, $1, '2026-08-20', 0, now(), now()
         FROM meters WHERE serie = $5 RETURNING historial_id, medidor_id
       ), readings AS (
         INSERT INTO lecturas(fecha, lectura_anterior, lectura_actual, consumo_calculado,
           periodo_id, medidor_id, estado, creado_en, actualizado_en)
         SELECT '2026-08-31', 0, $7, $7, $2, medidor_id, 'APROBADA', now(), now() FROM c
         UNION ALL
         SELECT '2026-09-30', $7, $7 + $8, $8, $2, medidor_id, 'APROBADA', now(), now() FROM c
       )
       SELECT a.historial_id AS history_a, b.historial_id AS history_b,
         c.historial_id AS history_c FROM a, b, c`,
        [
          scope.contrato_id,
          scope.periodo_id,
          `${params.prefix}-A`,
          `${params.prefix}-B`,
          `${params.prefix}-C`,
          bConsumption,
          cOriginConsumption,
          cDestinationConsumption,
        ],
      );
      const history = histories.rows[0];
      const replacements = await client.query<{
        reemplazo_id: string;
      }>(
        `INSERT INTO reemplazos_medidor(
         contrato_id, historial_saliente_id, historial_entrante_id,
         periodo_origen_id, periodo_destino_id, mes_origen, mes_destino,
         motivo, responsabilidad_dano, tratamiento_saliente, tratamiento_entrante,
         consumo_medido_saliente, consumo_facturable_saliente,
         estado, solicitado_por_usuario_id, autorizado_por_usuario_id, autorizado_en,
         estado_aprobacion, clave_idempotencia, huella_solicitud, creado_en, actualizado_en
       ) VALUES
       ($1, $2, $3, $5, CASE WHEN $7 = 'DIFERIR_SIGUIENTE_PERIODO' THEN $5 ELSE NULL END,
        8, CASE WHEN $7 = 'DIFERIR_SIGUIENTE_PERIODO' THEN 9 ELSE NULL END,
        'MANTENIMIENTO_PREVENTIVO', 'NO_APLICA', 'COBRO_REAL', $7::"TratamientoEntrante",
        15, 15, 'PENDIENTE', $6, $6, now(),
        'APROBADA', $9, $9, '2026-08-10', now()),
       ($1, $3, $4, $5, CASE WHEN $8 = 'DIFERIR_SIGUIENTE_PERIODO' THEN $5 ELSE NULL END,
        8, CASE WHEN $8 = 'DIFERIR_SIGUIENTE_PERIODO' THEN 9 ELSE NULL END,
        'MANTENIMIENTO_PREVENTIVO', 'NO_APLICA', 'COBRO_REAL', $8::"TratamientoEntrante",
        $10, $10, 'PENDIENTE', $6, $6, now(),
        'APROBADA', $11, $11, '2026-08-20', now())
       RETURNING reemplazo_id`,
        [
          scope.contrato_id,
          history.history_a,
          history.history_b,
          history.history_c,
          scope.periodo_id,
          scope.usuario_id,
          params.treatmentA,
          params.treatmentB,
          `${params.prefix}-A-B`,
          bConsumption,
          `${params.prefix}-B-C`,
        ],
      );
      return {
        communityId: scope.comunidad_id,
        periodId: scope.periodo_id,
        contractId: scope.contrato_id,
        replacementAId: replacements.rows[0].reemplazo_id,
        replacementBId: replacements.rows[1].reemplazo_id,
      };
    }

    void it('installs the final stored procedure body', async () => {
      const result = await client.query<{ definition: string }>(
        `SELECT pg_get_functiondef(
        'public.generar_prefacturas_lote(integer,integer,text,integer,bigint)'::regprocedure
      ) AS definition`,
      );
      assert.ok(result.rows[0].definition.includes('reemplazos_medidor'));
      assert.ok(result.rows[0].definition.includes('v_lote_id'));
    });

    void it('enforces route-aware active lot uniqueness including NULL routes', async () => {
      const community = await client.query<{ comunidad_id: number }>(
        `INSERT INTO comunidades(nombre, codigo, porcentaje_tasa_seguridad, creado_en, actualizado_en)
       VALUES ('Test', 'MIG-TEST', 0, now(), now()) RETURNING comunidad_id`,
      );
      const period = await client.query<{ periodo_id: number }>(
        `INSERT INTO periodos(nombre, fecha_inicio, fecha_fin, fecha_vencimiento, creado_en, actualizado_en)
       VALUES ('2026-test', '2026-01-01', '2026-12-31', '2027-01-15', now(), now())
       RETURNING periodo_id`,
      );
      const user = await client.query<{ usuario_id: number }>(
        `INSERT INTO usuarios(email, contrasenia, creado_en, actualizado_en)
       VALUES ('migration@test.local', 'not-used', now(), now()) RETURNING usuario_id`,
      );
      const route = await client.query<{ ruta_id: string }>(
        `INSERT INTO rutas(nombre, operario_id, tipo_ruta, comunidad_id, periodo_id, creado_en, actualizado_en)
       VALUES ('Route A', $1, 'TOMA_LECTURA', $2, $3, now(), now()) RETURNING ruta_id`,
        [
          user.rows[0].usuario_id,
          community.rows[0].comunidad_id,
          period.rows[0].periodo_id,
        ],
      );
      const values = [
        community.rows[0].comunidad_id,
        period.rows[0].periodo_id,
      ];

      await client.query(
        `INSERT INTO lote(comunidad_id, periodo_id, mes, estado, total_monto, total_emisiones, creado_en, actualizado_en)
       VALUES ($1, $2, 8, 'BORRADOR', 0, 0, now(), now())`,
        values,
      );

      await assert.rejects(
        async () => {
          await client.query(
            `INSERT INTO lote(comunidad_id, periodo_id, mes, estado, total_monto, total_emisiones, creado_en, actualizado_en)
           VALUES ($1, $2, 8, 'BORRADOR', 0, 0, now(), now())`,
            values,
          );
        },
        (error: unknown) => {
          assert.equal((error as { code?: string })?.code, '23505');
          return true;
        },
      );

      await client.query(
        `INSERT INTO lote(comunidad_id, periodo_id, mes, ruta_id, estado, total_monto, total_emisiones, creado_en, actualizado_en)
       VALUES ($1, $2, 8, $3, 'BORRADOR', 0, 0, now(), now())`,
        [...values, route.rows[0].ruta_id],
      );
      await client.query(
        `UPDATE lote SET borrado_en = now()
       WHERE comunidad_id = $1 AND periodo_id = $2 AND mes = 8 AND ruta_id IS NULL`,
        values,
      );

      const secondInsert = await client.query(
        `INSERT INTO lote(comunidad_id, periodo_id, mes, estado, total_monto, total_emisiones, creado_en, actualizado_en)
       VALUES ($1, $2, 8, 'BORRADOR', 0, 0, now(), now())`,
        values,
      );
      assert.ok(secondInsert);
    });

    void it('bills every A→B→C segment once with its tariff snapshot and converges on rerun', async () => {
      const ids = await client.query<{
        comunidad_id: number;
        periodo_id: number;
        usuario_id: number;
        contrato_id: string;
      }>(`
      WITH community AS (
        INSERT INTO comunidades(nombre, codigo, porcentaje_tasa_seguridad, creado_en, actualizado_en)
        VALUES ('Billing Test', 'BILL-TEST', 0, now(), now()) RETURNING comunidad_id
      ), period AS (
        INSERT INTO periodos(nombre, fecha_inicio, fecha_fin, fecha_vencimiento, creado_en, actualizado_en)
        VALUES ('billing-2026', '2026-01-01', '2026-12-31', '2027-01-15', now(), now())
        RETURNING periodo_id
      ), requester AS (
        INSERT INTO usuarios(email, contrasenia, creado_en, actualizado_en)
        VALUES ('billing@test.local', 'not-used', now(), now()) RETURNING usuario_id
      ), tariff AS (
        INSERT INTO categoria_tarifa(nombre, consumo_minimo_mensual, activo, creado_en, actualizado_en)
        VALUES ('Current tariff', 10, true, now(), now()) RETURNING categoria_tarifa_id
      ), tariff_fijo AS (
        INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro,
          tarifa_impuesto_id, categoria_tarifa_id, creado_en, actualizado_en)
        SELECT 'FIJO-BILL', 'Cargo Fijo Mensual', 'Cargo Fijo Mensual', 10, 'FIJO'::"TipoRubro",
          (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'),
          tariff.categoria_tarifa_id, now(), now()
        FROM tariff
      ), tariff_var AS (
        INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro,
          tarifa_impuesto_id, categoria_tarifa_id, creado_en, actualizado_en)
        SELECT 'VAR-BILL', 'Consumo Agua', 'Consumo Agua', 5, 'VARIABLE'::"TipoRubro",
          (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'),
          tariff.categoria_tarifa_id, now(), now()
        FROM tariff
      ), customer AS (
        INSERT INTO clientes(apellidos, identificacion, nombres, creado_en, actualizado_en)
        VALUES ('Test', 'BILL-CUSTOMER', 'Billing', now(), now()) RETURNING cliente_id
      ), contract AS (
        INSERT INTO contratos(cliente_id, categoria_tarifa_id, numero_guia,
          direccion_suministro, estado, comunidad_id, creado_en, actualizado_en)
        SELECT customer.cliente_id, tariff.categoria_tarifa_id, 'BILL-GUIDE', 'Test',
          'ACTIVO', community.comunidad_id, now(), now()
        FROM customer, tariff, community RETURNING contrato_id
      )
      SELECT community.comunidad_id, period.periodo_id, requester.usuario_id,
        contract.contrato_id FROM community, period, requester, contract;
    `);
      const scope = ids.rows[0];

      const histories = await client.query<{
        history_a: string;
        history_b: string;
        history_c: string;
      }>(
        `
      WITH meters AS (
        INSERT INTO medidores(marca, modelo, serie, estado, creado_en, actualizado_en)
        VALUES ('T', 'T', 'BILL-A', 'BODEGA', now(), now()),
               ('T', 'T', 'BILL-B', 'BODEGA', now(), now()),
               ('T', 'T', 'BILL-C', 'INSTALADO', now(), now())
        RETURNING medidor_id, serie
      ), a AS (
        INSERT INTO historial_medidores(medidor_id, contrato_id, fecha_desde, fecha_hasta,
          lectura_inicial_historial, lectura_final_historial, creado_en, actualizado_en)
        SELECT medidor_id, $1, '2026-01-01', '2026-08-10', 0, 15, now(), now()
        FROM meters WHERE serie = 'BILL-A' RETURNING historial_id
      ), b AS (
        INSERT INTO historial_medidores(medidor_id, contrato_id, fecha_desde, fecha_hasta,
          lectura_inicial_historial, lectura_final_historial, creado_en, actualizado_en)
        SELECT medidor_id, $1, '2026-08-10', '2026-08-20', 0, 20, now(), now()
        FROM meters WHERE serie = 'BILL-B' RETURNING historial_id
      ), c AS (
        INSERT INTO historial_medidores(medidor_id, contrato_id, fecha_desde,
          lectura_inicial_historial, creado_en, actualizado_en)
        SELECT medidor_id, $1, '2026-08-20', 0, now(), now()
        FROM meters WHERE serie = 'BILL-C' RETURNING historial_id, medidor_id
      ), reading AS (
        INSERT INTO lecturas(fecha, lectura_anterior, lectura_actual, consumo_calculado,
          periodo_id, medidor_id, estado, creado_en, actualizado_en)
        SELECT '2026-08-31', 0, 25, 25, $2, medidor_id, 'APROBADA', now(), now() FROM c
      )
      SELECT a.historial_id AS history_a, b.historial_id AS history_b,
        c.historial_id AS history_c FROM a, b, c;
    `,
        [scope.contrato_id, scope.periodo_id],
      );
      const history = histories.rows[0];

      await client.query(
        `INSERT INTO reemplazos_medidor(
        contrato_id, historial_saliente_id, historial_entrante_id,
        periodo_origen_id, mes_origen, motivo, responsabilidad_dano,
        tratamiento_saliente, tratamiento_entrante, consumo_medido_saliente,
        consumo_facturable_saliente, estado,
        solicitado_por_usuario_id, autorizado_por_usuario_id, autorizado_en,
        estado_aprobacion, clave_idempotencia, huella_solicitud, creado_en, actualizado_en
      ) VALUES
      ($1, $2, $3, $5, 8, 'MANTENIMIENTO_PREVENTIVO', 'NO_APLICA', 'COBRO_REAL',
       'FACTURAR_PERIODO_ACTUAL', 15, 15, 'PENDIENTE',
       $6, $6, now(), 'APROBADA', 'sp-a-b', 'a', '2026-08-10', now()),
      ($1, $3, $4, $5, 8, 'MANTENIMIENTO_PREVENTIVO', 'NO_APLICA', 'COBRO_REAL',
       'FACTURAR_PERIODO_ACTUAL', 20, 20, 'PENDIENTE',
       $6, $6, now(), 'APROBADA', 'sp-b-c', 'b', '2026-08-20', now())`,
        [
          scope.contrato_id,
          history.history_a,
          history.history_b,
          history.history_c,
          scope.periodo_id,
          scope.usuario_id,
        ],
      );

      const first = await client.query<{ lote_id: string }>(
        'SELECT generar_prefacturas_lote($1, $2, $3, 8, NULL) AS lote_id',
        [scope.periodo_id, scope.comunidad_id, 'integration-test'],
      );
      assert.ok(first.rows[0].lote_id);

      const details = await client.query<{
        descripcion: string;
        subtotal: string;
      }>(
        `SELECT pd.descripcion, pd.subtotal::TEXT
       FROM prefactura_detalle pd
       JOIN prefacturas p ON p.prefactura_id = pd.prefactura_id
       WHERE p.lote_id = $1 ORDER BY pd.prefactura_detalle_id`,
        [first.rows[0].lote_id],
      );
      assert.equal(
        details.rows.filter((row) => row.descripcion === 'Cargo Fijo Mensual')
          .length,
        1,
      );

      const linked = await client.query<{ outgoing: string; incoming: string }>(
        `SELECT prefactura_detalle_saliente_id::TEXT AS outgoing,
              prefactura_detalle_entrante_id::TEXT AS incoming
       FROM reemplazos_medidor WHERE contrato_id = $1 ORDER BY reemplazo_id`,
        [scope.contrato_id],
      );
      assert.notEqual(linked.rows[0].outgoing, linked.rows[0].incoming);
      assert.notEqual(linked.rows[1].outgoing, linked.rows[1].incoming);
    });
  },
);
