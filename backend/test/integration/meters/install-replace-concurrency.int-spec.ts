import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import { Decimal } from 'decimal.js';
import { Prisma } from '../../../src/generated/prisma/client';
import {
  EstadoMedidor,
  EstadoContrato,
  MotivoReemplazoMedidor,
  TratamientoSaliente,
  TratamientoEntrante,
} from '../../../src/shared/enums';
import { PrismaMeterRepository } from '../../../src/metering/meters/infrastructure/repositories/prisma-meter.repository';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import type { LoggerService } from '../../../src/infrastructure/observability/logger/logger.service';

describe(
  'Install & Replace Concurrency Integration Tests (Real PostgreSQL)',
  { timeout: 180_000 },
  () => {
    let container: StartedPostgreSqlContainer;
    let databaseUrl: string;
    let prismaService: PrismaService;
    let monitorPrisma: PrismaService;
    let repository: PrismaMeterRepository;

    const mockLogger = {
      error: () => {},
      warn: () => {},
      log: () => {},
      debug: () => {},
    } as unknown as LoggerService;

    function createPrismaService(url: string): PrismaService {
      const configService = {
        getOrThrow: (key: string) => {
          if (key === 'DATABASE_URL') return url;
          throw new Error(`Unknown key: ${key}`);
        },
        get: (key: string) => {
          if (key === 'DATABASE_URL') return url;
          return undefined;
        },
      } as unknown as ConfigService;
      return new PrismaService(configService);
    }

    async function createMeterUpdateBarrier(
      client: PrismaService,
      contratoId: bigint,
      medidorId: bigint,
    ) {
      const suffix = contratoId.toString();
      const functionName = `test_meter_barrier_${suffix}`;
      const triggerName = `test_meter_barrier_trigger_${suffix}`;
      await client.$executeRawUnsafe(`
        CREATE FUNCTION ${functionName}() RETURNS trigger
        LANGUAGE plpgsql AS $$
        BEGIN
          IF NEW.medidor_id = ${medidorId} THEN
            PERFORM pg_advisory_xact_lock(2147483647, ${contratoId});
          END IF;
          RETURN NEW;
        END;
        $$;
      `);
      await client.$executeRawUnsafe(`
        CREATE TRIGGER ${triggerName}
        BEFORE UPDATE ON medidores
        FOR EACH ROW EXECUTE FUNCTION ${functionName}();
      `);

      let resolveReady!: () => void;
      let rejectReady!: (error: unknown) => void;
      let release!: () => void;
      const ready = new Promise<void>((resolve, reject) => {
        resolveReady = resolve;
        rejectReady = reject;
      });
      const released = new Promise<void>((resolve) => {
        release = resolve;
      });
      const finished = client.$transaction(async (tx) => {
        try {
          await tx.$executeRawUnsafe(
            `SELECT pg_advisory_xact_lock(2147483647, ${contratoId})`,
          );
          resolveReady();
          await released;
        } catch (error) {
          rejectReady(error);
          throw error;
        }
      });

      const cleanup = async (): Promise<void> => {
        await client.$executeRawUnsafe(
          `DROP TRIGGER IF EXISTS ${triggerName} ON medidores`,
        );
        await client.$executeRawUnsafe(
          `DROP FUNCTION IF EXISTS ${functionName}()`,
        );
      };

      return { ready, release, finished, cleanup };
    }

    async function waitForProductionLockWait(
      client: PrismaService,
      expectedWaiters: number,
      timeoutMs = 4000,
    ): Promise<boolean> {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const result = await client.$queryRawUnsafe<
          Array<{ waiter_count: number }>
        >(
          `
          SELECT count(DISTINCT waiter.pid)::int AS waiter_count
          FROM pg_stat_activity AS waiter
          CROSS JOIN LATERAL unnest(pg_blocking_pids(waiter.pid)) AS blocked(pid)
          WHERE waiter.wait_event_type = 'Lock'
            AND EXISTS (
              SELECT 1
              FROM pg_locks AS contract_lock
              JOIN pg_class AS contract_table
                ON contract_table.oid = contract_lock.relation
              WHERE contract_lock.pid = waiter.pid
                AND contract_lock.granted
                AND contract_table.relname = 'contratos'
            );
        `,
        );
        if (result.length > 0 && result[0].waiter_count >= expectedWaiters) {
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      return false;
    }

    before(
      async () => {
        container = await new PostgreSqlContainer('postgres:16.3-alpine')
          .withDatabase('jasrapo_concurrency_test')
          .withUsername('test')
          .withPassword('test')
          .start();

        databaseUrl = container.getConnectionUri();
        process.env.DATABASE_URL = databaseUrl;

        const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        execFileSync(npxCmd, ['prisma', 'migrate', 'deploy'], {
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: databaseUrl },
          stdio: 'pipe',
        });

        prismaService = createPrismaService(databaseUrl);
        monitorPrisma = createPrismaService(databaseUrl);
        await prismaService.$connect();
        await monitorPrisma.$connect();
        repository = new PrismaMeterRepository(prismaService, mockLogger);

        // Seed basic tax & catalog dependencies
        await prismaService.$executeRawUnsafe(`
          INSERT INTO catalogo_impuestos(codigo, nombre, activo, created_at, updated_at)
          VALUES ('99', 'Test Tax', true, now(), now()) ON CONFLICT DO NOTHING;

          INSERT INTO catalogo_tarifas_impuesto(
            impuesto_id, codigo_porcentaje, descripcion, porcentaje,
            vigente_desde, activo, created_at, updated_at
          ) VALUES ((SELECT id FROM catalogo_impuestos WHERE codigo = '99'), '0', 'Zero', 0,
            '2026-01-01', true, now(), now()) ON CONFLICT DO NOTHING;

          INSERT INTO rubros(codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro,
            tarifa_impuesto_id, creado_en, actualizado_en)
          SELECT code, code, code, 0, kind::"TipoRubro",
            (SELECT id FROM catalogo_tarifas_impuesto WHERE descripcion = 'Zero'), now(), now()
          FROM (VALUES ('001', 'VARIABLE'), ('002', 'FIJO'), ('003', 'MULTA'), ('004', 'OTRO')) v(code, kind)
          ON CONFLICT DO NOTHING;
        `);
      },
      { timeout: 180_000 },
    );

    after(async () => {
      await monitorPrisma?.$disconnect();
      await prismaService?.$disconnect();
      await container?.stop();
      delete process.env.DATABASE_URL;
    });

    let testUser: { usuarioId: number };
    let testCategory: { categoriaTarifaId: number };
    let testPeriod: { periodoId: number };
    let testCommunity: { comunidadId: number };
    let testClient: { clienteId: bigint };

    beforeEach(async () => {
      // Clear transactional tables
      await prismaService.reemplazoMedidor.deleteMany();
      await prismaService.lecturas.deleteMany();
      await prismaService.historialMedidores.deleteMany();
      await prismaService.contratos.deleteMany();
      await prismaService.medidores.deleteMany();
      await prismaService.clientes.deleteMany();
      await prismaService.comunidades.deleteMany();
      await prismaService.categoriaTarifa.deleteMany();
      await prismaService.periodos.deleteMany();
      await prismaService.usuarios.deleteMany();

      testUser = await prismaService.usuarios.create({
        data: {
          email: `tester-${Date.now()}@example.com`,
          clave: 'hashed_password',
        },
      });

      testCategory = await prismaService.categoriaTarifa.create({
        data: {
          nombre: 'Residencial',
          consumoMinimoMensual: 10,
          activo: true,
        },
      });

      testPeriod = await prismaService.periodos.create({
        data: {
          nombre: 'Periodo 2026-01',
          fechaInicio: new Date('2026-01-01'),
          fechaFin: new Date('2026-01-31'),
          fechaVencimiento: new Date('2026-02-15'),
          estado: 'ABIERTO',
        },
      });

      testCommunity = await prismaService.comunidades.create({
        data: {
          nombre: 'Comunidad Central',
          codigo: 'COM-01',
          porcentajeTasaSeguridad: new Prisma.Decimal(0),
        },
      });

      testClient = await prismaService.clientes.create({
        data: {
          identificacion: '0999999999',
          nombres: 'Juan',
          apellidos: 'Perez',
        },
      });
    });

    it('barrier test: replaceMeter acquires the contract lock before installMeter', async () => {
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-INITIAL-LATCH1',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const replacementMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-REPLACEMENT-LATCH1',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.BODEGA,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-LATCH-01',
          direccionSuministro: 'Av Central 123',
          estado: EstadoContrato.PENDIENTE_INSTALACION,
          categoriaTarifaId: testCategory.categoriaTarifaId,
          comunidadId: testCommunity.comunidadId,
          clienteId: testClient.clienteId,
        },
      });

      const initialHistorial = await prismaService.historialMedidores.create({
        data: {
          contratoId: contract.contratoId,
          medidorId: initialMeter.medidorId,
          lecturaInicial: new Prisma.Decimal(100),
          motivo: 'VINCULACION INICIAL',
        },
      });

      const barrier = await createMeterUpdateBarrier(
        monitorPrisma,
        contract.contratoId,
        initialMeter.medidorId,
      );
      await barrier.ready;
      const replacePromise = repository.replaceMeter({
        contratoId: contract.contratoId,
        nuevoMedidorId: replacementMeter.medidorId,
        lecturaFinalSaliente: new Decimal(150),
        lecturaInicialEntrante: new Decimal(0),
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriod.periodoId,
        solicitadoPorUsuarioId: testUser.usuarioId,
        claveIdempotencia: 'idemp-latch1-01',
        huellaSolicitud: 'fingerprint-latch1-01',
        requiereAprobacion: false,
      });
      let installPromise: Promise<unknown> | undefined;
      try {
        assert.equal(
          await waitForProductionLockWait(monitorPrisma, 1),
          true,
          'replaceMeter must hold the contract lock while waiting on its outgoing meter',
        );
        installPromise = repository.installMeter({
          contratoId: contract.contratoId,
          medidorId: initialMeter.medidorId,
          estado: EstadoMedidor.INSTALADO,
          estadoContrato: EstadoContrato.ACTIVO,
          fechaInstalacion: new Date(),
        });
        assert.equal(
          await waitForProductionLockWait(monitorPrisma, 2),
          true,
          'installMeter must wait for replaceMeter on the contratos row lock',
        );
        barrier.release();
        await replacePromise;
        await assert.rejects(installPromise, (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.match(
            error.message,
            /Meter must be in PENDIENTE state|Conflicto de concurrencia|could not serialize access/,
          );
          return true;
        });
      } finally {
        barrier.release();
        await Promise.allSettled([
          replacePromise,
          installPromise ?? Promise.resolve(),
          barrier.finished,
        ]);
        await barrier.cleanup();
      }

      const dbContract = await prismaService.contratos.findUnique({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(dbContract?.estado, EstadoContrato.PENDIENTE_INSTALACION);
      const activeHistories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId, fechaHasta: null },
      });
      assert.equal(activeHistories.length, 1);
      assert.equal(activeHistories[0].medidorId, replacementMeter.medidorId);

      const closedHistory = await prismaService.historialMedidores.findUnique({
        where: { historialId: initialHistorial.historialId },
      });
      assert.ok(closedHistory?.fechaHasta !== null);

      const dbInitialMeter = await prismaService.medidores.findUnique({
        where: { medidorId: initialMeter.medidorId },
      });
      const dbReplacementMeter = await prismaService.medidores.findUnique({
        where: { medidorId: replacementMeter.medidorId },
      });
      assert.equal(dbInitialMeter?.estado, EstadoMedidor.DANADO);
      assert.ok(dbInitialMeter?.fechaBaja !== null);
      assert.equal(dbReplacementMeter?.estado, EstadoMedidor.INSTALADO);
      assert.ok(dbReplacementMeter?.fechaInstalacion !== null);

      const ledgers = await prismaService.reemplazoMedidor.findMany({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(ledgers.length, 1);
      assert.equal(
        ledgers[0].historialSalienteId,
        initialHistorial.historialId,
      );
      assert.equal(
        ledgers[0].historialEntranteId,
        activeHistories[0].historialId,
      );

      const readings = await prismaService.lecturas.findMany({
        where: {
          medidorId: {
            in: [initialMeter.medidorId, replacementMeter.medidorId],
          },
        },
      });
      assert.equal(readings.length, 2);
    });

    it('barrier test: installMeter acquires the contract lock before replaceMeter', async () => {
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-INITIAL-LATCH2',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const replacementMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-REPLACEMENT-LATCH2',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.BODEGA,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-LATCH-02',
          direccionSuministro: 'Av Central 456',
          estado: EstadoContrato.PENDIENTE_INSTALACION,
          categoriaTarifaId: testCategory.categoriaTarifaId,
          comunidadId: testCommunity.comunidadId,
          clienteId: testClient.clienteId,
        },
      });

      const initialHistorial = await prismaService.historialMedidores.create({
        data: {
          contratoId: contract.contratoId,
          medidorId: initialMeter.medidorId,
          lecturaInicial: new Prisma.Decimal(100),
          motivo: 'VINCULACION INICIAL',
        },
      });

      const barrier = await createMeterUpdateBarrier(
        monitorPrisma,
        contract.contratoId,
        initialMeter.medidorId,
      );
      await barrier.ready;
      const installPromise = repository.installMeter({
        contratoId: contract.contratoId,
        medidorId: initialMeter.medidorId,
        estado: EstadoMedidor.INSTALADO,
        estadoContrato: EstadoContrato.ACTIVO,
        fechaInstalacion: new Date(),
      });
      let replacePromise: Promise<unknown> | undefined;
      try {
        assert.equal(
          await waitForProductionLockWait(monitorPrisma, 1),
          true,
          'installMeter must hold the contract lock while waiting on its meter',
        );
        replacePromise = repository.replaceMeter({
          contratoId: contract.contratoId,
          nuevoMedidorId: replacementMeter.medidorId,
          lecturaFinalSaliente: new Decimal(150),
          lecturaInicialEntrante: new Decimal(0),
          motivo: MotivoReemplazoMedidor.DANO,
          tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
          tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
          periodoOrigenId: testPeriod.periodoId,
          solicitadoPorUsuarioId: testUser.usuarioId,
          claveIdempotencia: 'idemp-latch2-01',
          huellaSolicitud: 'fingerprint-latch2-01',
          requiereAprobacion: false,
        });
        assert.equal(
          await waitForProductionLockWait(monitorPrisma, 2),
          true,
          'replaceMeter must wait for installMeter on the contratos row lock',
        );
        barrier.release();
        await installPromise;
        await assert.rejects(replacePromise, (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.match(
            error.message,
            /could not serialize access|modificado concurrentemente|concurrent update/,
          );
          return true;
        });
      } finally {
        barrier.release();
        await Promise.allSettled([
          installPromise,
          replacePromise ?? Promise.resolve(),
          barrier.finished,
        ]);
        await barrier.cleanup();
      }

      // Both production operations commit in the order established by the barrier.
      const dbContract = await prismaService.contratos.findUnique({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(dbContract?.estado, EstadoContrato.ACTIVO);

      const dbInitialMeter = await prismaService.medidores.findUnique({
        where: { medidorId: initialMeter.medidorId },
      });
      assert.equal(dbInitialMeter?.estado, EstadoMedidor.INSTALADO);
      assert.equal(dbInitialMeter?.fechaBaja, null);

      const dbReplacementMeter = await prismaService.medidores.findUnique({
        where: { medidorId: replacementMeter.medidorId },
      });
      assert.equal(dbReplacementMeter?.estado, EstadoMedidor.BODEGA);

      const activeHistories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId, fechaHasta: null },
      });
      assert.equal(activeHistories.length, 1);
      assert.equal(activeHistories[0].medidorId, initialMeter.medidorId);
      assert.equal(
        activeHistories[0].historialId,
        initialHistorial.historialId,
      );

      const ledgers = await prismaService.reemplazoMedidor.findMany({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(ledgers.length, 0);

      const readings = await prismaService.lecturas.findMany({
        where: {
          medidorId: {
            in: [initialMeter.medidorId, replacementMeter.medidorId],
          },
        },
      });
      assert.equal(readings.length, 0);
    });

    it('proves post-replacement preemption: after replaceMeter completes, installMeter for replaced meter is rejected', async () => {
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-INITIAL-SEQ1',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const replacementMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-REPLACEMENT-SEQ1',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.BODEGA,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-SEQ-01',
          direccionSuministro: 'Av Central 123',
          estado: EstadoContrato.PENDIENTE_INSTALACION,
          categoriaTarifaId: testCategory.categoriaTarifaId,
          comunidadId: testCommunity.comunidadId,
          clienteId: testClient.clienteId,
        },
      });

      const initialHistorial = await prismaService.historialMedidores.create({
        data: {
          contratoId: contract.contratoId,
          medidorId: initialMeter.medidorId,
          lecturaInicial: new Prisma.Decimal(100),
          motivo: 'VINCULACION INICIAL',
        },
      });

      // 1. replaceMeter completes in production
      const replaceResult = await repository.replaceMeter({
        contratoId: contract.contratoId,
        nuevoMedidorId: replacementMeter.medidorId,
        lecturaFinalSaliente: new Decimal(150),
        lecturaInicialEntrante: new Decimal(0),
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriod.periodoId,
        solicitadoPorUsuarioId: testUser.usuarioId,
        claveIdempotencia: 'idemp-seq1-01',
        huellaSolicitud: 'fingerprint-seq1-01',
        requiereAprobacion: false,
      });

      assert.ok(replaceResult);

      // 2. installMeter for the outgoing meter is rejected
      await assert.rejects(
        async () => {
          await repository.installMeter({
            contratoId: contract.contratoId,
            medidorId: initialMeter.medidorId,
            estado: EstadoMedidor.INSTALADO,
            estadoContrato: EstadoContrato.ACTIVO,
            fechaInstalacion: new Date(),
          });
        },
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.match(
            error.message,
            /Meter must be in PENDIENTE state|Conflicto de concurrencia/,
          );
          return true;
        },
      );

      // 3. Verify final DB consistency
      const activeHistories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId, fechaHasta: null },
      });
      assert.equal(activeHistories.length, 1);
      assert.equal(activeHistories[0].medidorId, replacementMeter.medidorId);

      const dbInitialMeter = await prismaService.medidores.findUnique({
        where: { medidorId: initialMeter.medidorId },
      });
      const dbReplacementMeter = await prismaService.medidores.findUnique({
        where: { medidorId: replacementMeter.medidorId },
      });
      assert.equal(dbInitialMeter?.estado, EstadoMedidor.DANADO);
      assert.equal(dbReplacementMeter?.estado, EstadoMedidor.INSTALADO);

      const ledgers = await prismaService.reemplazoMedidor.findMany({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(ledgers.length, 1);
      assert.equal(
        ledgers[0].historialSalienteId,
        initialHistorial.historialId,
      );
      assert.equal(
        ledgers[0].historialEntranteId,
        activeHistories[0].historialId,
      );
    });

    it('proves post-installation serialization: after installMeter completes, replaceMeter executes cleanly on installed meter with valid reading', async () => {
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-INITIAL-SEQ2',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const replacementMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-REPLACEMENT-SEQ2',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.BODEGA,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-SEQ-02',
          direccionSuministro: 'Av Central 456',
          estado: EstadoContrato.PENDIENTE_INSTALACION,
          categoriaTarifaId: testCategory.categoriaTarifaId,
          comunidadId: testCommunity.comunidadId,
          clienteId: testClient.clienteId,
        },
      });

      const initialHistorial = await prismaService.historialMedidores.create({
        data: {
          contratoId: contract.contratoId,
          medidorId: initialMeter.medidorId,
          lecturaInicial: new Prisma.Decimal(100),
          motivo: 'VINCULACION INICIAL',
        },
      });

      // 1. installMeter completes first
      const installResult = await repository.installMeter({
        contratoId: contract.contratoId,
        medidorId: initialMeter.medidorId,
        estado: EstadoMedidor.INSTALADO,
        estadoContrato: EstadoContrato.ACTIVO,
        fechaInstalacion: new Date(),
      });

      assert.ok(installResult);

      // 2. replaceMeter executes with valid reading (150 >= 100)
      const replaceResult = await repository.replaceMeter({
        contratoId: contract.contratoId,
        nuevoMedidorId: replacementMeter.medidorId,
        lecturaFinalSaliente: new Decimal(150),
        lecturaInicialEntrante: new Decimal(0),
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriod.periodoId,
        solicitadoPorUsuarioId: testUser.usuarioId,
        claveIdempotencia: 'idemp-seq2-01',
        huellaSolicitud: 'fingerprint-seq2-01',
        requiereAprobacion: false,
      });

      assert.ok(replaceResult);

      // 3. Verify final DB state
      const dbContract = await prismaService.contratos.findUnique({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(dbContract?.estado, EstadoContrato.ACTIVO);

      const dbInitialMeter = await prismaService.medidores.findUnique({
        where: { medidorId: initialMeter.medidorId },
      });
      assert.equal(dbInitialMeter?.estado, EstadoMedidor.DANADO);
      assert.ok(dbInitialMeter?.fechaBaja !== null);

      const dbReplacementMeter = await prismaService.medidores.findUnique({
        where: { medidorId: replacementMeter.medidorId },
      });
      assert.equal(dbReplacementMeter?.estado, EstadoMedidor.INSTALADO);
      assert.ok(dbReplacementMeter?.fechaInstalacion !== null);

      const activeHistories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId, fechaHasta: null },
      });
      assert.equal(activeHistories.length, 1);
      assert.equal(activeHistories[0].medidorId, replacementMeter.medidorId);

      const closedHistory = await prismaService.historialMedidores.findUnique({
        where: { historialId: initialHistorial.historialId },
      });
      assert.ok(closedHistory?.fechaHasta !== null);

      const ledgers = await prismaService.reemplazoMedidor.findMany({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(ledgers.length, 1);
      assert.equal(
        ledgers[0].historialSalienteId,
        initialHistorial.historialId,
      );
      assert.equal(
        ledgers[0].historialEntranteId,
        activeHistories[0].historialId,
      );

      const readings = await prismaService.lecturas.findMany({
        where: {
          medidorId: {
            in: [initialMeter.medidorId, replacementMeter.medidorId],
          },
        },
      });
      assert.equal(readings.length, 2);
    });

    it('rejects installMeter if active history belongs to a different meter (simulating post-replacement race)', async () => {
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-STALE-01',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const currentActiveMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-ACTIVE-02',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.INSTALADO,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-RACE-02',
          direccionSuministro: 'Calle 10',
          estado: EstadoContrato.PENDIENTE_INSTALACION,
          categoriaTarifaId: testCategory.categoriaTarifaId,
          comunidadId: testCommunity.comunidadId,
          clienteId: testClient.clienteId,
        },
      });

      // Active history currently points to METER-ACTIVE-02
      await prismaService.historialMedidores.create({
        data: {
          contratoId: contract.contratoId,
          medidorId: currentActiveMeter.medidorId,
          lecturaInicial: new Prisma.Decimal(0),
          motivo: 'REEMPLAZO PREVIO',
        },
      });

      // Attempting to install initialMeter must be rejected with concurrency conflict
      await assert.rejects(
        async () => {
          await repository.installMeter({
            contratoId: contract.contratoId,
            medidorId: initialMeter.medidorId,
            estado: EstadoMedidor.INSTALADO,
            estadoContrato: EstadoContrato.ACTIVO,
            fechaInstalacion: new Date(),
          });
        },
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.match(
            error.message,
            /Conflicto de concurrencia: el contrato #.* está vinculado al medidor #.*, no al #/,
          );
          return true;
        },
      );

      // Verify rollback: active history was untouched
      const activeHistories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId, fechaHasta: null },
      });
      assert.equal(activeHistories.length, 1);
      assert.equal(activeHistories[0].medidorId, currentActiveMeter.medidorId);

      // Verify initialMeter remained in PENDIENTE state (no ghost installation)
      const untouchedMeter = await prismaService.medidores.findUnique({
        where: { medidorId: initialMeter.medidorId },
      });
      assert.equal(untouchedMeter?.estado, EstadoMedidor.PENDIENTE);

      // No ledger created
      const ledgers = await prismaService.reemplazoMedidor.findMany({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(ledgers.length, 0);
    });

    it('rejects installMeter when contract has no active history at all', async () => {
      const meter = await prismaService.medidores.create({
        data: {
          serie: 'METER-ORPHAN-01',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-NO-HIST-03',
          direccionSuministro: 'Calle 20',
          estado: EstadoContrato.PENDIENTE_INSTALACION,
          categoriaTarifaId: testCategory.categoriaTarifaId,
          comunidadId: testCommunity.comunidadId,
          clienteId: testClient.clienteId,
        },
      });

      await assert.rejects(
        async () => {
          await repository.installMeter({
            contratoId: contract.contratoId,
            medidorId: meter.medidorId,
            estado: EstadoMedidor.INSTALADO,
            estadoContrato: EstadoContrato.ACTIVO,
            fechaInstalacion: new Date(),
          });
        },
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.match(
            error.message,
            /no tiene un historial de medidor activo/,
          );
          return true;
        },
      );

      // Verify rollback: meter stays PENDIENTE, contract stays PENDIENTE_INSTALACION, 0 histories
      const dbMeter = await prismaService.medidores.findUnique({
        where: { medidorId: meter.medidorId },
      });
      const dbContract = await prismaService.contratos.findUnique({
        where: { contratoId: contract.contratoId },
      });
      const histories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId },
      });

      assert.equal(dbMeter?.estado, EstadoMedidor.PENDIENTE);
      assert.equal(dbContract?.estado, EstadoContrato.PENDIENTE_INSTALACION);
      assert.equal(histories.length, 0);
    });
  },
);
