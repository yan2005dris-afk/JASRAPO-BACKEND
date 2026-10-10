import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { PrismaReadingRepository } from '../../../src/metering/readings/infrastructure/repositories/prisma-reading.repository';
import {
  EstadoPeriodo,
  EstadoLectura,
  EstadoMedidor,
} from '../../../src/shared/enums';

void describe(
  'PrismaReadingRepository (integration)',
  { timeout: 180_000 },
  () => {
    let container: StartedPostgreSqlContainer;
    let prisma: PrismaService;
    let repository: PrismaReadingRepository;

    let testMedidorId: bigint;
    let testPeriodoId: number;
    let testContratoId: bigint;

    before(
      async () => {
        container = await new PostgreSqlContainer('postgres:16.3-alpine')
          .withDatabase('testdb')
          .withUsername('test')
          .withPassword('test')
          .start();

        const databaseUrl = container.getConnectionUri();

        execSync('npx prisma migrate deploy', {
          env: { ...process.env, DATABASE_URL: databaseUrl },
          cwd: process.cwd(),
          stdio: 'pipe',
        });

        const module = await Test.createTestingModule({
          providers: [
            {
              provide: ConfigService,
              useValue: {
                getOrThrow: (key: string) => {
                  if (key === 'DATABASE_URL') return databaseUrl;
                  throw new Error(`Unknown config key: ${key}`);
                },
                get: (key: string) => {
                  if (key === 'DATABASE_URL') return databaseUrl;
                  return undefined;
                },
              },
            },
            {
              provide: PrismaService,
              useFactory: (configService: ConfigService) =>
                new PrismaService(configService),
              inject: [ConfigService],
            },
            {
              provide: PrismaReadingRepository,
              useFactory: (prismaService: PrismaService) =>
                new PrismaReadingRepository(prismaService),
              inject: [PrismaService],
            },
          ],
        }).compile();

        prisma = module.get(PrismaService);
        repository = module.get(PrismaReadingRepository);

        await prisma.$connect();
      },
      { timeout: 180_000 },
    );

    after(async () => {
      await prisma?.$disconnect();
      await container?.stop();
    });

    beforeEach(async () => {
      // Clean tables via TRUNCATE CASCADE
      await prisma.$executeRawUnsafe(
        'TRUNCATE "novedades_ordenes_trabajo", "ordenes_trabajo", "rutas", "lecturas", "historial_medidores", "contratos", "clientes", "categoria_tarifa", "comunidades", "medidores", "periodos" RESTART IDENTITY CASCADE',
      );

      // Seed common base data
      const periodo = await prisma.periodos.create({
        data: {
          nombre: '2026-06',
          fechaInicio: new Date('2026-06-01'),
          fechaFin: new Date('2026-06-30'),
          fechaVencimiento: new Date('2026-07-10'),
          estado: EstadoPeriodo.ABIERTO,
        },
      });
      testPeriodoId = periodo.periodoId;

      const cliente = await prisma.clientes.create({
        data: {
          nombres: 'Carlos',
          apellidos: 'Vera',
          identificacion: '0912345678',
        },
      });

      const categoria = await prisma.categoriaTarifa.create({
        data: { nombre: 'Residencial' },
      });

      const comunidad = await prisma.comunidades.create({
        data: { nombre: 'Olón', codigo: 'OLON', porcentajeTasaSeguridad: 0 },
      });

      const medidor = await prisma.medidores.create({
        data: {
          serie: 'INT-READ-001',
          marca: 'Actaris',
          modelo: 'Flostar',
          estado: EstadoMedidor.INSTALADO,
        },
      });
      testMedidorId = medidor.medidorId;

      const contrato = await prisma.contratos.create({
        data: {
          clienteId: cliente.clienteId,
          categoriaTarifaId: categoria.categoriaTarifaId,
          comunidadId: comunidad.comunidadId,
          numeroGuia: 'GUI-INT-001',
          direccionSuministro: 'Calle Principal 10',
          estadoServicio: 'ACTIVO',
          estadoCobranza: 'AL_DIA',
        },
      });
      testContratoId = contrato.contratoId;
    });

    void it('findActivePeriod returns the currently open period', async () => {
      const activePeriod = await repository.findActivePeriod();
      assert.ok(activePeriod);
      assert.equal(activePeriod.periodoId, testPeriodoId);
    });

    void it('findReadingSnapshot resolves initial reading from active meter history', async () => {
      const fechaAsignacion = new Date('2026-01-01');
      await prisma.historialMedidores.create({
        data: {
          contratoId: testContratoId,
          medidorId: testMedidorId,
          fechaDesde: fechaAsignacion,
          lecturaInicial: 120,
        },
      });

      const snapshot = await repository.findReadingSnapshot(
        testMedidorId,
        new Date('2026-06-15'),
      );

      assert.ok(snapshot);
      assert.equal(snapshot.lecturaAnterior.toNumber(), 120);
    });

    void it('findReadingSnapshot resolves from latest approved prior reading instead of initial', async () => {
      const fechaAsignacion = new Date('2026-01-01');
      await prisma.historialMedidores.create({
        data: {
          contratoId: testContratoId,
          medidorId: testMedidorId,
          fechaDesde: fechaAsignacion,
          lecturaInicial: 100,
        },
      });

      // Crear lectura previa APROBADA
      await prisma.lecturas.create({
        data: {
          medidorId: testMedidorId,
          periodoId: testPeriodoId,
          lecturaAnterior: 100,
          lecturaActual: 185,
          consumoCalculado: 85,
          estado: EstadoLectura.APROBADA,
          fecha: new Date('2026-05-15'),
        },
      });

      const snapshot = await repository.findReadingSnapshot(
        testMedidorId,
        new Date('2026-06-15'),
      );

      assert.ok(snapshot);
      assert.equal(snapshot.lecturaAnterior.toNumber(), 185);
    });

    void it('findMany and count exclude soft-deleted readings', async () => {
      await prisma.lecturas.create({
        data: {
          medidorId: testMedidorId,
          periodoId: testPeriodoId,
          lecturaAnterior: 100,
          lecturaActual: 150,
          consumoCalculado: 50,
          estado: EstadoLectura.PENDIENTE,
          fecha: new Date('2026-06-10'),
          deletedAt: null,
        },
      });

      await prisma.lecturas.create({
        data: {
          medidorId: testMedidorId,
          periodoId: testPeriodoId,
          lecturaAnterior: 150,
          lecturaActual: 190,
          consumoCalculado: 40,
          estado: EstadoLectura.ANULADA,
          fecha: new Date('2026-06-11'),
          deletedAt: new Date(),
        },
      });

      const count = await repository.count();
      const list = await repository.findMany({});

      assert.equal(count, 1);
      assert.equal(list.length, 1);
      assert.equal(list[0].lecturaActual, 150);
    });

    void it('updateWithCas successfully transitions state and rejects stale CAS concurrently', async () => {
      const lectura = await prisma.lecturas.create({
        data: {
          medidorId: testMedidorId,
          periodoId: testPeriodoId,
          lecturaAnterior: 100,
          lecturaActual: 150,
          consumoCalculado: 50,
          estado: EstadoLectura.PENDIENTE,
          fecha: new Date('2026-06-10'),
        },
      });

      // Primer update CAS exitoso
      const updated = await repository.updateWithCas(
        { lecturaId: lectura.lecturaId, estado: EstadoLectura.PENDIENTE },
        { estado: EstadoLectura.POR_REVISION, lecturaActual: 160 },
      );

      assert.ok(updated);
      assert.equal(updated.estado, EstadoLectura.POR_REVISION);
      assert.equal(updated.lecturaActual, 160);

      // Segundo update CAS con estado viejo (PENDIENTE) falla al retornar null
      const staleCas = await repository.updateWithCas(
        { lecturaId: lectura.lecturaId, estado: EstadoLectura.PENDIENTE },
        { estado: EstadoLectura.APROBADA },
      );

      assert.equal(staleCas, null);
    });
  },
);
