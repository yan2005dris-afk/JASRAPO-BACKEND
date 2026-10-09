import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { after, before, describe, it } from 'node:test';

const require = createRequire(import.meta.url);

interface BenefitCase {
  key: string;
  senior: boolean;
  disability: boolean;
  consumption: number;
}

const CASES: BenefitCase[] = [
  { key: 'no-benefit', senior: false, disability: false, consumption: 5 },
  {
    key: 'senior-below-base',
    senior: true,
    disability: false,
    consumption: 8,
  },
  {
    key: 'senior-at-base',
    senior: true,
    disability: false,
    consumption: 10,
  },
  {
    key: 'senior-above-base',
    senior: true,
    disability: false,
    consumption: 15,
  },
  {
    key: 'disability-below-base',
    senior: false,
    disability: true,
    consumption: 5,
  },
  {
    key: 'disability-above-base',
    senior: false,
    disability: true,
    consumption: 11,
  },
  { key: 'both-below-base', senior: true, disability: true, consumption: 5 },
];

interface PreInvoiceRow {
  descuento_total: string;
  total_pagar: string;
  tipo_descuento: string | null;
  monto_descontado: string | null;
}

void describe(
  'automatic senior and disability discount when generating the batch',
  { timeout: 240_000 },
  () => {
    let container: StartedPostgreSqlContainer;
    let client: Client;
    const rowsByCase = new Map<string, PreInvoiceRow[]>();

    before(
      async () => {
        container = await new PostgreSqlContainer('postgres:16.3-alpine')
          .withDatabase('jasrapo_test')
          .withUsername('test')
          .withPassword('test')
          .start();
        const connectionString = container.getConnectionUri();
        execFileSync(
          process.execPath,
          [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
          {
            cwd: process.cwd(),
            env: { ...process.env, DATABASE_URL: connectionString },
            stdio: 'pipe',
          },
        );
        client = new Client({ connectionString });
        await client.connect();
        await seedBase();
        const { periodoId, comunidadId, categoriaId } = await seedScope();
        for (const [index, benefit] of CASES.entries()) {
          await seedContract(
            benefit,
            index,
            categoriaId,
            comunidadId,
            periodoId,
          );
        }
        await client.query(
          `SELECT public.generar_prefacturas_lote($1::int, $2::int, 'test', 9, NULL::bigint)`,
          [periodoId, comunidadId],
        );
        for (const benefit of CASES) {
          const result = await client.query<PreInvoiceRow>(
            `SELECT p.descuento_total::text, p.total_pagar::text,
                    cd.tipo_descuento::text AS tipo_descuento,
                    dd.monto_descontado::text AS monto_descontado
             FROM prefacturas p
             JOIN contratos c ON c.contrato_id = p.contrato_id
             LEFT JOIN prefactura_detalle pd ON pd.prefactura_id = p.prefactura_id
             LEFT JOIN descuento_detalle dd ON dd.prefactura_detalle_id = pd.prefactura_detalle_id
             LEFT JOIN catalogo_descuento cd ON cd.catalogo_descuento_id = dd.catalogo_descuento_id
             WHERE c.numero_guia = $1
             ORDER BY cd.tipo_descuento::text`,
            [`GUIA-${benefit.key}`],
          );
          rowsByCase.set(benefit.key, result.rows);
        }
      },
      { timeout: 240_000 },
    );

    after(async () => {
      await client?.end();
      await container?.stop();
    });

    async function seedBase(): Promise<void> {
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
        INSERT INTO catalogo_descuento(nombre, tipo_descuento, valor, es_porcentaje, activo, aplica_automatico)
        VALUES ('Tercera edad', 'TERCERA_EDAD', 50, true, true, true),
               ('Discapacidad', 'DISCAPACIDAD', 30, true, true, true);
      `);
    }

    async function seedScope(): Promise<{
      periodoId: number;
      comunidadId: number;
      categoriaId: number;
    }> {
      const result = await client.query<{
        periodo_id: number;
        comunidad_id: number;
        categoria_tarifa_id: number;
      }>(
        `WITH community AS (
           INSERT INTO comunidades(nombre, codigo, porcentaje_tasa_seguridad, creado_en, actualizado_en)
           VALUES ('Test community', 'COM-BEN', 0, now(), now()) RETURNING comunidad_id
         ), period AS (
           INSERT INTO periodos(nombre, fecha_inicio, fecha_fin, fecha_vencimiento, creado_en, actualizado_en)
           VALUES ('2026-BEN', '2026-01-01', '2026-12-31', '2027-01-15', now(), now())
           RETURNING periodo_id
         ), tariff AS (
           INSERT INTO categoria_tarifa(nombre, consumo_minimo_mensual, activo, creado_en, actualizado_en)
           VALUES ('Test tariff', 10, true, now(), now()) RETURNING categoria_tarifa_id
         ), fijo AS (
           INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro,
             tarifa_impuesto_id, categoria_tarifa_id, creado_en, actualizado_en)
           SELECT 'FIJO-BEN', 'Cargo Fijo', 'Cargo Fijo', 4, 'FIJO'::"TipoRubro",
             (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'),
             tariff.categoria_tarifa_id, now(), now() FROM tariff
         ), variable AS (
           INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro,
             tarifa_impuesto_id, categoria_tarifa_id, creado_en, actualizado_en)
           SELECT 'VAR-BEN', 'Consumo Agua', 'Consumo Agua', 0.4, 'VARIABLE'::"TipoRubro",
             (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'),
             tariff.categoria_tarifa_id, now(), now() FROM tariff
         )
         SELECT community.comunidad_id, period.periodo_id, tariff.categoria_tarifa_id
         FROM community, period, tariff`,
      );
      const row = result.rows[0];
      return {
        periodoId: row.periodo_id,
        comunidadId: row.comunidad_id,
        categoriaId: row.categoria_tarifa_id,
      };
    }

    async function seedContract(
      benefit: BenefitCase,
      index: number,
      categoriaId: number,
      comunidadId: number,
      periodoId: number,
    ): Promise<void> {
      await client.query(
        `WITH customer AS (
           INSERT INTO clientes(apellidos, identificacion, nombres, aplica_tercera_edad,
             aplica_discapacidad, creado_en, actualizado_en)
           VALUES ('Test', $1, 'Benefit', $2, $3, now(), now()) RETURNING cliente_id
         ), contract AS (
           INSERT INTO contratos(cliente_id, categoria_tarifa_id, numero_guia,
             direccion_suministro, estado_servicio, comunidad_id, creado_en, actualizado_en)
           SELECT customer.cliente_id, $4, $5, 'Test', 'ACTIVO'::"EstadoServicioContrato", $6, now(), now()
           FROM customer RETURNING contrato_id
         ), meter AS (
           INSERT INTO medidores(marca, modelo, serie, estado, creado_en, actualizado_en)
           VALUES ('T', 'T', $7, 'INSTALADO', now(), now()) RETURNING medidor_id
         ), history AS (
           INSERT INTO historial_medidores(medidor_id, contrato_id, fecha_desde,
             lectura_inicial_historial, creado_en, actualizado_en)
           SELECT meter.medidor_id, contract.contrato_id, '2026-01-01', 0, now(), now()
           FROM meter, contract
         )
         INSERT INTO lecturas(fecha, lectura_anterior, lectura_actual, consumo_calculado,
           periodo_id, medidor_id, estado, creado_en, actualizado_en)
         SELECT '2026-09-15', 100, 100 + $8, $8, $9, meter.medidor_id,
           'APROBADA'::"EstadoLectura", now(), now() FROM meter`,
        [
          `CLI-${index}`,
          benefit.senior,
          benefit.disability,
          categoriaId,
          `GUIA-${benefit.key}`,
          comunidadId,
          `SERIE-${index}`,
          benefit.consumption,
          periodoId,
        ],
      );
    }

    function totalDescuento(key: string): number {
      return Number(rowsByCase.get(key)?.[0]?.descuento_total);
    }

    function details(key: string): Array<[string | null, number | null]> {
      return (rowsByCase.get(key) ?? [])
        .filter((row) => row.tipo_descuento !== null)
        .map((row) => [row.tipo_descuento, Number(row.monto_descontado)]);
    }

    void it('does not discount a client without benefit', () => {
      assert.equal(totalDescuento('no-benefit'), 0);
      assert.deepEqual(details('no-benefit'), []);
    });

    void it('applies the senior discount when consumption is below the base consumption', () => {
      assert.equal(totalDescuento('senior-below-base'), 2);
      assert.deepEqual(details('senior-below-base'), [['TERCERA_EDAD', 2]]);
    });

    void it('applies the senior discount when consumption equals the base consumption', () => {
      assert.equal(totalDescuento('senior-at-base'), 2);
      assert.deepEqual(details('senior-at-base'), [['TERCERA_EDAD', 2]]);
    });

    void it('does not apply the senior discount when consumption exceeds the base consumption', () => {
      assert.equal(totalDescuento('senior-above-base'), 0);
      assert.deepEqual(details('senior-above-base'), []);
    });

    void it('applies the disability discount below the base consumption and not above it', () => {
      assert.equal(totalDescuento('disability-below-base'), 1.2);
      assert.deepEqual(details('disability-below-base'), [
        ['DISCAPACIDAD', 1.2],
      ]);
      assert.equal(totalDescuento('disability-above-base'), 0);
      assert.deepEqual(details('disability-above-base'), []);
    });

    void it('adds both benefits and records one detail for each', () => {
      assert.equal(totalDescuento('both-below-base'), 3.2);
      assert.deepEqual(details('both-below-base'), [
        ['DISCAPACIDAD', 1.2],
        ['TERCERA_EDAD', 2],
      ]);
    });

    void it('subtracts the discount from the total to pay', () => {
      assert.equal(
        Number(rowsByCase.get('senior-below-base')?.[0]?.total_pagar),
        2,
      );
      assert.equal(
        Number(rowsByCase.get('senior-above-base')?.[0]?.total_pagar),
        4 + 5 * 0.4,
      );
    });
  },
);
