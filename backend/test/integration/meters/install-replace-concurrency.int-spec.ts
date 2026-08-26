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

void describe(
  'Install & Replace Concurrency Integration Tests (Real PostgreSQL)',
  { timeout: 180_000 },
  () => {
    let container: StartedPostgreSqlContainer;
    let databaseUrl: string;
    let prismaService: PrismaService;
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

    async function waitForBlockedTransaction(
      client: PrismaService,
      timeoutMs = 5000,
    ): Promise<boolean> {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const result = await client.$queryRawUnsafe<Array<{ count: bigint }>>(
          `SELECT count(*)::bigint as count FROM pg_locks WHERE NOT granted;`,
        );
        if (result.length > 0 && Number(result[0].count) > 0) {
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
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
        await prismaService.$connect();
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

    void it('case 1: replace holds FOR UPDATE lock first -> install blocks -> replace commits -> install unblocks and is rejected with full rollback', async () => {
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-INITIAL-SYNC1',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const replacementMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-REPLACEMENT-SYNC1',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.BODEGA,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-SYNC-01',
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

      // 1. Tx1 acquires FOR UPDATE lock on the contract and executes replacement mutations, pausing before commit
      let continueTx1: () => void = () => {};
      const lockHeldPromise = new Promise<void>((resolve) => {
        prismaService.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT contrato_id FROM contratos WHERE contrato_id = ${contract.contratoId} FOR UPDATE`;
          resolve();

          // Wait until Tx2 is actively blocked on this lock
          await new Promise<void>((cont) => {
            continueTx1 = cont;
          });

          // Execute replacement mutations inside Tx1
          const now = new Date();
          await tx.historialMedidores.update({
            where: { historialId: initialHistorial.historialId },
            data: { fechaHasta: now },
          });

          await tx.medidores.update({
            where: { medidorId: initialMeter.medidorId },
            data: { estado: EstadoMedidor.DANADO, fechaBaja: now },
          });

          const newHistorial = await tx.historialMedidores.create({
            data: {
              contratoId: contract.contratoId,
              medidorId: replacementMeter.medidorId,
              fechaDesde: now,
              lecturaInicial: new Prisma.Decimal(0),
              motivo: 'Reemplazo de medidor',
            },
          });

          await tx.medidores.update({
            where: { medidorId: replacementMeter.medidorId },
            data: { estado: EstadoMedidor.INSTALADO, fechaInstalacion: now },
          });

          const salienteReading = await tx.lecturas.create({
            data: {
              medidorId: initialMeter.medidorId,
              periodoId: testPeriod.periodoId,
              lecturaAnterior: new Prisma.Decimal(100),
              lecturaActual: new Prisma.Decimal(150),
              consumoCalculado: new Prisma.Decimal(50),
              fecha: now,
              estado: 'APROBADA',
            },
          });

          const entranteReading = await tx.lecturas.create({
            data: {
              medidorId: replacementMeter.medidorId,
              periodoId: testPeriod.periodoId,
              lecturaAnterior: new Prisma.Decimal(0),
              lecturaActual: new Prisma.Decimal(0),
              consumoCalculado: new Prisma.Decimal(0),
              fecha: now,
              estado: 'APROBADA',
            },
          });

          await tx.reemplazoMedidor.create({
            data: {
              contratoId: contract.contratoId,
              historialSalienteId: initialHistorial.historialId,
              historialEntranteId: newHistorial.historialId,
              lecturaFinalSalienteId: salienteReading.lecturaId,
              lecturaInicialEntranteId: entranteReading.lecturaId,
              motivo: MotivoReemplazoMedidor.DANO,
              tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
              tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
              periodoOrigenId: testPeriod.periodoId,
              solicitadoPorUsuarioId: testUser.usuarioId,
              tarifaOrigenSnapshot: {},
              claveIdempotencia: 'idemp-sync1-01',
              huellaSolicitud: 'fingerprint-sync1-01',
            },
          });
        });
      });

      await lockHeldPromise;

      // 2. Tx2 calls installMeter and blocks in PostgreSQL waiting for lock
      const installPromise = repository.installMeter({
        contratoId: contract.contratoId,
        medidorId: initialMeter.medidorId,
        estado: EstadoMedidor.INSTALADO,
        estadoContrato: EstadoContrato.ACTIVO,
        fechaInstalacion: new Date(),
      });

      // 3. Prove that Tx2 is physically blocked on pg_locks
      const isBlocked = await waitForBlockedTransaction(prismaService);
      assert.equal(isBlocked, true, 'installMeter must be blocked on the FOR UPDATE lock held by Tx1');

      // 4. Release Tx1 to commit
      continueTx1();

      // 5. installMeter unblocks and is rejected due to updated meter/history state
      await assert.rejects(
        installPromise,
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.match(
            error.message,
            /Meter must be in PENDIENTE state|Conflicto de concurrencia/,
          );
          return true;
        },
      );

      // 6. Verify complete database state:
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
      assert.equal(dbReplacementMeter?.estado, EstadoMedidor.INSTALADO);

      const ledgers = await prismaService.reemplazoMedidor.findMany({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(ledgers.length, 1);
      assert.equal(ledgers[0].historialSalienteId, initialHistorial.historialId);
      assert.equal(ledgers[0].historialEntranteId, activeHistories[0].historialId);

      const readings = await prismaService.lecturas.findMany({
        where: {
          medidorId: { in: [initialMeter.medidorId, replacementMeter.medidorId] },
        },
      });
      assert.equal(readings.length, 2);
    });

    void it('case 2: install holds FOR UPDATE lock first -> replace blocks -> install commits -> replace unblocks and fails serialization with full rollback', async () => {
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-INITIAL-SYNC2',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const replacementMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-REPLACEMENT-SYNC2',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.BODEGA,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-SYNC-02',
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

      // 1. Tx1 acquires FOR UPDATE lock on the contract and executes install mutations, pausing before commit
      let continueTx1: () => void = () => {};
      const lockHeldPromise = new Promise<void>((resolve) => {
        prismaService.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT contrato_id FROM contratos WHERE contrato_id = ${contract.contratoId} FOR UPDATE`;
          resolve();

          // Wait until Tx2 is actively blocked on this lock
          await new Promise<void>((cont) => {
            continueTx1 = cont;
          });

          // Execute install mutations inside Tx1
          const now = new Date();
          await tx.medidores.update({
            where: { medidorId: initialMeter.medidorId },
            data: { estado: EstadoMedidor.INSTALADO, fechaInstalacion: now },
          });

          await tx.historialMedidores.update({
            where: { historialId: initialHistorial.historialId },
            data: { fechaDesde: now },
          });

          await tx.contratos.update({
            where: { contratoId: contract.contratoId },
            data: { estado: EstadoContrato.ACTIVO },
          });
        });
      });

      await lockHeldPromise;

      // 2. Tx2 calls replaceMeter with valid reading (150 > 100) and blocks in PostgreSQL
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
        claveIdempotencia: 'idemp-sync2-01',
        huellaSolicitud: 'fingerprint-sync2-01',
        requiereAprobacion: false,
      });

      // 3. Prove that Tx2 is physically blocked on pg_locks
      const isBlocked = await waitForBlockedTransaction(prismaService);
      assert.equal(isBlocked, true, 'replaceMeter must be blocked on the FOR UPDATE lock held by Tx1');

      // 4. Release Tx1 to commit installation
      continueTx1();

      // 5. Tx2 unblocks and is aborted by PostgreSQL serialization (40001) due to concurrent update on locked row
      await assert.rejects(
        replacePromise,
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.match(error.message, /could not serialize access/);
          return true;
        },
      );

      // 6. Verify final database state:
      // Contract is ACTIVO from install
      const dbContract = await prismaService.contratos.findUnique({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(dbContract?.estado, EstadoContrato.ACTIVO);

      // Initial meter is INSTALADO from install
      const dbInitialMeter = await prismaService.medidores.findUnique({
        where: { medidorId: initialMeter.medidorId },
      });
      assert.equal(dbInitialMeter?.estado, EstadoMedidor.INSTALADO);
      assert.equal(dbInitialMeter?.fechaBaja, null);

      // Replacement meter remained in BODEGA (no ghost mutation!)
      const dbReplacementMeter = await prismaService.medidores.findUnique({
        where: { medidorId: replacementMeter.medidorId },
      });
      assert.equal(dbReplacementMeter?.estado, EstadoMedidor.BODEGA);

      // Exactly ONE active history pointing to initialMeter
      const activeHistories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId, fechaHasta: null },
      });
      assert.equal(activeHistories.length, 1);
      assert.equal(activeHistories[0].medidorId, initialMeter.medidorId);
      assert.equal(activeHistories[0].historialId, initialHistorial.historialId);

      // No ledger entry created (0 orphan rows)
      const ledgers = await prismaService.reemplazoMedidor.findMany({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(ledgers.length, 0);

      // No replacement readings created
      const readings = await prismaService.lecturas.findMany({
        where: {
          medidorId: { in: [initialMeter.medidorId, replacementMeter.medidorId] },
        },
      });
      assert.equal(readings.length, 0);
    });

    void it('rejects installMeter if active history belongs to a different meter (simulating post-replacement race)', async () => {
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

    void it('rejects installMeter when contract has no active history at all', async () => {
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
          assert.match(error.message, /no tiene un historial de medidor activo/);
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
