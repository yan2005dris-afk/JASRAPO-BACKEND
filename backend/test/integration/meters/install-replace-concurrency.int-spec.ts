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

    before(
      async () => {
        container = await new PostgreSqlContainer('postgres:16.3-alpine')
          .withDatabase('jasrapo_concurrency_test')
          .withUsername('test')
          .withPassword('test')
          .start();

        databaseUrl = container.getConnectionUri();
        process.env.DATABASE_URL = databaseUrl;

        execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
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

    void it('proves concurrency race: when replaceMeter runs while installMeter is queued, installMeter is rejected and ledger is preserved', async () => {
      // Create initial meter and contract in PENDIENTE_INSTALACION
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-INITIAL-01',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const replacementMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-REPLACEMENT-02',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.BODEGA,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-CONCURRENCY-01',
          direccionSuministro: 'Av Central 123',
          estado: EstadoContrato.PENDIENTE_INSTALACION,
          categoriaTarifaId: testCategory.categoriaTarifaId,
          comunidadId: testCommunity.comunidadId,
          clienteId: testClient.clienteId,
        },
      });

      // Initial active link in PENDIENTE state
      const initialHistorial = await prismaService.historialMedidores.create({
        data: {
          contratoId: contract.contratoId,
          medidorId: initialMeter.medidorId,
          lecturaInicial: new Prisma.Decimal(100),
          motivo: 'VINCULACION INICIAL',
        },
      });

      // Execute replaceMeter and installMeter concurrently on the exact same contract
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
        claveIdempotencia: 'idemp-concurrent-01',
        huellaSolicitud: 'fingerprint-concurrent-01',
        requiereAprobacion: false,
      });

      const installPromise = repository.installMeter({
        contratoId: contract.contratoId,
        medidorId: initialMeter.medidorId,
        estado: EstadoMedidor.INSTALADO,
        estadoContrato: EstadoContrato.ACTIVO,
        fechaInstalacion: new Date(),
      });

      const [replaceResult, installResult] = await Promise.allSettled([
        replacePromise,
        installPromise,
      ]);

      // 1. Exactly one operation must succeed and the other must be rejected
      assert.equal(replaceResult.status, 'fulfilled');
      assert.equal(installResult.status, 'rejected');

      // 2. Error of rejected install operation
      assert.match(
        (installResult as PromiseRejectedResult).reason?.message ?? '',
        /Meter must be in PENDIENTE state|Conflicto de concurrencia|no tiene un historial/,
      );

      // 3. Exactly one active history row pointing to replacement meter
      const activeHistories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId, fechaHasta: null },
      });
      assert.equal(activeHistories.length, 1);
      assert.equal(activeHistories[0].medidorId, replacementMeter.medidorId);

      // 4. Closed history for initial meter
      const closedHistory = await prismaService.historialMedidores.findUnique({
        where: { historialId: initialHistorial.historialId },
      });
      assert.ok(closedHistory?.fechaHasta !== null);

      // 5. Meter final states
      const dbInitialMeter = await prismaService.medidores.findUnique({
        where: { medidorId: initialMeter.medidorId },
      });
      const dbReplacementMeter = await prismaService.medidores.findUnique({
        where: { medidorId: replacementMeter.medidorId },
      });
      assert.equal(dbInitialMeter?.estado, EstadoMedidor.DANADO);
      assert.equal(dbReplacementMeter?.estado, EstadoMedidor.INSTALADO);

      // 6. Ledger entry ReemplazoMedidor must exist and be unique
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

    void it('proves inverse race: when installMeter runs first, conflicting replaceMeter fails with full rollback', async () => {
      const initialMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-INITIAL-INV',
          marca: 'Actaris',
          modelo: 'A1',
          estado: EstadoMedidor.PENDIENTE,
        },
      });

      const replacementMeter = await prismaService.medidores.create({
        data: {
          serie: 'METER-REPLACEMENT-INV',
          marca: 'Actaris',
          modelo: 'A2',
          estado: EstadoMedidor.BODEGA,
        },
      });

      const contract = await prismaService.contratos.create({
        data: {
          numeroGuia: 'CTR-CONCURRENCY-INV',
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
          lecturaInicial: new Prisma.Decimal(200),
          motivo: 'VINCULACION INICIAL',
        },
      });

      // Install runs first and completes successfully
      const installPromise = repository.installMeter({
        contratoId: contract.contratoId,
        medidorId: initialMeter.medidorId,
        estado: EstadoMedidor.INSTALADO,
        estadoContrato: EstadoContrato.ACTIVO,
        fechaInstalacion: new Date(),
      });

      // Concurrently or immediately queued replace with invalid final reading (lower than initial reading 200)
      const replacePromise = repository.replaceMeter({
        contratoId: contract.contratoId,
        nuevoMedidorId: replacementMeter.medidorId,
        lecturaFinalSaliente: new Decimal(100), // Invalido: menor a 200
        lecturaInicialEntrante: new Decimal(0),
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: testPeriod.periodoId,
        solicitadoPorUsuarioId: testUser.usuarioId,
        claveIdempotencia: 'idemp-concurrent-inv-01',
        huellaSolicitud: 'fingerprint-concurrent-inv-01',
        requiereAprobacion: false,
      });

      const [installResult, replaceResult] = await Promise.allSettled([
        installPromise,
        replacePromise,
      ]);

      // 1. Install must succeed, replace must be rejected
      assert.equal(installResult.status, 'fulfilled');
      assert.equal(replaceResult.status, 'rejected');

      // 2. Validate rejection error of failed replacement (serialization conflict or validation failure)
      assert.match(
        (replaceResult as PromiseRejectedResult).reason?.message ?? '',
        /could not serialize access|La lectura final de retiro .* no puede ser menor a la lectura base previa/,
      );

      // 3. Database state: Contract is ACTIVO, initial meter is INSTALADO, replacement meter remains in BODEGA
      const dbContract = await prismaService.contratos.findUnique({
        where: { contratoId: contract.contratoId },
      });
      const dbInitialMeter = await prismaService.medidores.findUnique({
        where: { medidorId: initialMeter.medidorId },
      });
      const dbReplacementMeter = await prismaService.medidores.findUnique({
        where: { medidorId: replacementMeter.medidorId },
      });

      assert.equal(dbContract?.estado, EstadoContrato.ACTIVO);
      assert.equal(dbInitialMeter?.estado, EstadoMedidor.INSTALADO);
      assert.equal(dbReplacementMeter?.estado, EstadoMedidor.BODEGA);

      // 4. Exactly one active history row pointing to initialMeter
      const activeHistories = await prismaService.historialMedidores.findMany({
        where: { contratoId: contract.contratoId, fechaHasta: null },
      });
      assert.equal(activeHistories.length, 1);
      assert.equal(activeHistories[0].medidorId, initialMeter.medidorId);
      assert.equal(activeHistories[0].historialId, initialHistorial.historialId);

      // 5. No orphan ledger records
      const ledgers = await prismaService.reemplazoMedidor.findMany({
        where: { contratoId: contract.contratoId },
      });
      assert.equal(ledgers.length, 0);
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
          assert.match(error.message, /Conflicto de concurrencia: el contrato #.* está vinculado al medidor #.*, no al #/);
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
