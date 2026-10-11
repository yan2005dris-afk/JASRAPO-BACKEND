import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'src/generated/prisma/client';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PrismaOperatorRepository } from 'src/operations/operator/infrastructure/repositories/prisma-operator.repository';
import { execSync } from 'node:child_process';
import * as path from 'node:path';

jest.setTimeout(120_000);

describe('PrismaOperatorRepository (integration)', () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;
  let repository: PrismaOperatorRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16.3-alpine')
      .withDatabase('testdb')
      .withUsername('test')
      .withPassword('test')
      .start();

    const databaseUrl = container.getConnectionUri();

    // Run migrations on the test container
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    // Build a minimal NestJS module with a real PrismaService
    // connected to the test container
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockImplementation((key: string) => {
              if (key === 'DATABASE_URL') return databaseUrl;
              throw new Error(`Unknown config key: ${key}`);
            }),
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'DATABASE_URL') return databaseUrl;
              return undefined;
            }),
          },
        },
        PrismaService,
        PrismaOperatorRepository,
      ],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaOperatorRepository);

    await prisma.$connect();
  }, 120_000);

  afterAll(async () => {
    await prisma?.$disconnect();
    await container?.stop();
  });

  beforeEach(async () => {
    // Clean tables in FK-safe order
    await prisma.$executeRawUnsafe('DELETE FROM "rutas"');
    await prisma.$executeRawUnsafe('DELETE FROM "medidores"');
    await prisma.$executeRawUnsafe('DELETE FROM "usuarios"');
    await prisma.$executeRawUnsafe('DELETE FROM "periodos"');
    await prisma.$executeRawUnsafe('DELETE FROM "comunidades"');
    await prisma.$executeRawUnsafe('DELETE FROM "sectores"');
  });

  // ── helpers ────────────────────────────────────────────────────────

  async function tipoActividadId(codigo: string): Promise<bigint> {
    const type = await prisma.tipoActividad.findUnique({ where: { codigo } });
    if (!type) throw new Error(`Missing activity type ${codigo}`);
    return type.tipoActividadId;
  }

  async function seedBasicData() {
    const comunidad = await prisma.comunidades.create({
      data: {
        nombre: 'Test Comunidad',
        codigo: `TC-${Date.now()}`,
        porcentajeTasaSeguridad: 0,
      },
    });

    const periodo = await prisma.periodos.create({
      data: {
        nombre: `Test Period ${Date.now()}`,
        fechaInicio: new Date('2026-01-01'),
        fechaFin: new Date('2026-01-31'),
        fechaVencimiento: new Date('2026-02-15'),
      },
    });

    const operario = await prisma.usuarios.create({
      data: {
        email: `operario-${Date.now()}@test.com`,
        clave: 'hashed_password',
        nombres: 'Operario',
        apellidos: 'Test',
      },
    });

    return { comunidad, periodo, operario };
  }

  // ── findRoutesByOperator ───────────────────────────────────────────

  describe('findRoutesByOperator', () => {
    it('returns routes ordered by comunidadId, sectorId, orden', async () => {
      const { periodo, operario, comunidad } = await seedBasicData();

      // Create routes with intentional out-of-order
      await prisma.rutas.createMany({
        data: [
          {
            nombre: 'Ruta C',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 3,
          },
          {
            nombre: 'Ruta A',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 1,
          },
          {
            nombre: 'Ruta B',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 2,
          },
        ],
      });

      const tasks = await repository.findRoutesByOperator(
        operario.usuarioId,
        periodo.periodoId,
      );

      expect(tasks).toHaveLength(3);
      expect(tasks[0].orden).toBe(1);
      expect(tasks[1].orden).toBe(2);
      expect(tasks[2].orden).toBe(3);
    });

    it('filters by tipoRuta when provided', async () => {
      const { periodo, operario, comunidad } = await seedBasicData();

      await prisma.rutas.createMany({
        data: [
          {
            nombre: 'Lectura Route',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 1,
          },
          {
            nombre: 'Install Route',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('INSTALACION'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 2,
          },
        ],
      });

      const tasks = await repository.findRoutesByOperator(
        operario.usuarioId,
        periodo.periodoId,
        'INSTALACION',
      );

      expect(tasks).toHaveLength(1);
      expect(tasks[0].tipoActividad.codigo).toBe('INSTALACION');
    });

    it('excludes soft-deleted routes (deletedAt IS NOT NULL)', async () => {
      const { periodo, operario, comunidad } = await seedBasicData();

      await prisma.rutas.createMany({
        data: [
          {
            nombre: 'Active Route',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 1,
          },
          {
            nombre: 'Deleted Route',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 2,
            deletedAt: new Date(),
          },
        ],
      });

      const tasks = await repository.findRoutesByOperator(
        operario.usuarioId,
        periodo.periodoId,
      );

      expect(tasks).toHaveLength(1);
      expect(tasks[0].nombre).toBe('Active Route');
    });

    it('returns empty array for unknown operario/periodo', async () => {
      const tasks = await repository.findRoutesByOperator(9999, 9999);
      expect(tasks).toHaveLength(0);
    });
  });

  // ── updateRouteState ───────────────────────────────────────────────

  describe('updateRouteState', () => {
    it('updates state when expectedEstado matches', async () => {
      const { periodo, operario, comunidad } = await seedBasicData();

      const ruta = await prisma.rutas.create({
        data: {
          nombre: 'Concurrency OK',
          operarioId: operario.usuarioId,
          tipoActividadId: await tipoActividadId('LECTURA'),
          comunidadId: comunidad.comunidadId,
          periodoId: periodo.periodoId,
          estado: 'PENDIENTE',
          orden: 1,
        },
      });

      const now = new Date();
      const updated = await repository.updateRouteState(
        ruta.rutaId,
        { estado: 'EN_PROGRESO', fechaInicio: now },
        'PENDIENTE',
      );

      expect(updated.estado).toBe('EN_PROGRESO');
      expect(updated.fechaInicio).toBeDefined();
    });

    it('throws PrismaNotFound (P2025) when expectedEstado does not match', async () => {
      const { periodo, operario, comunidad } = await seedBasicData();

      const ruta = await prisma.rutas.create({
        data: {
          nombre: 'Wrong expected estado',
          operarioId: operario.usuarioId,
          tipoActividadId: await tipoActividadId('LECTURA'),
          comunidadId: comunidad.comunidadId,
          periodoId: periodo.periodoId,
          estado: 'COMPLETADA',
          orden: 1,
        },
      });

      await expect(
        repository.updateRouteState(
          ruta.rutaId,
          { estado: 'EN_PROGRESO' },
          'PENDIENTE', // does not match actual COMPLETADA
        ),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Conflicto de concurrencia'),
        }),
      );
    });

    it('updates regardless of current state when expectedEstado is omitted', async () => {
      const { periodo, operario, comunidad } = await seedBasicData();

      const ruta = await prisma.rutas.create({
        data: {
          nombre: 'No guard check',
          operarioId: operario.usuarioId,
          tipoActividadId: await tipoActividadId('LECTURA'),
          comunidadId: comunidad.comunidadId,
          periodoId: periodo.periodoId,
          estado: 'PENDIENTE',
          orden: 1,
        },
      });

      const updated = await repository.updateRouteState(ruta.rutaId, {
        estado: 'COMPLETADA',
        fechaFin: new Date(),
        observacion: 'All done',
      });

      expect(updated.estado).toBe('COMPLETADA');
      expect(updated.observacion).toBe('All done');
    });
  });

  // ── findActivePeriod ───────────────────────────────────────────────

  describe('findActivePeriod', () => {
    it('returns the open period', async () => {
      const active = await prisma.periodos.create({
        data: {
          nombre: `Active-${Date.now()}`,
          fechaInicio: new Date(),
          fechaFin: new Date(),
          fechaVencimiento: new Date(),
          estado: 'ABIERTO',
        },
      });

      // Create a closed period that should NOT be returned
      await prisma.periodos.create({
        data: {
          nombre: `Closed-${Date.now()}`,
          fechaInicio: new Date(),
          fechaFin: new Date(),
          fechaVencimiento: new Date(),
          estado: 'CERRADO',
        },
      });

      const result = await repository.findActivePeriod();
      expect(result).not.toBeNull();
      expect(result!.periodoId).toBe(active.periodoId);
    });

    it('returns null when no period is open', async () => {
      const result = await repository.findActivePeriod();
      expect(result).toBeNull();
    });
  });

  // ── findActiveRoutes ───────────────────────────────────────────────

  describe('findActiveRoutes', () => {
    it('returns only non-cancelled/non-completed routes for operator & period', async () => {
      const { periodo, operario, comunidad } = await seedBasicData();

      await prisma.rutas.createMany({
        data: [
          {
            nombre: 'Pending',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            estado: 'PENDIENTE',
            orden: 1,
          },
          {
            nombre: 'In Progress',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            estado: 'EN_PROGRESO',
            orden: 2,
          },
          {
            nombre: 'Cancelled',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            estado: 'CANCELADA',
            orden: 3,
          },
          {
            nombre: 'Completed',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            estado: 'COMPLETADA',
            orden: 4,
          },
        ],
      });

      const routes = await repository.findActiveRoutes(
        operario.usuarioId,
        periodo.periodoId,
      );

      expect(routes).toHaveLength(2);
      // findActiveRoutes returns RouteData (rutaId, comunidadId, sectorId)
      // — it must exclude CANCELADA and COMPLETADA
      expect(routes.every((r) => r.rutaId)).toBe(true);
      expect(routes.every((r) => r.comunidadId)).toBe(true);
    });
  });

  // ── getMaxOrdenInZona ──────────────────────────────────────────────

  describe('getMaxOrdenInZona', () => {
    it('returns the max orden for comunidad+sector', async () => {
      const { periodo, operario, comunidad } = await seedBasicData();

      await prisma.rutas.createMany({
        data: [
          {
            nombre: 'R1',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 5,
          },
          {
            nombre: 'R2',
            operarioId: operario.usuarioId,
            tipoActividadId: await tipoActividadId('LECTURA'),
            comunidadId: comunidad.comunidadId,
            periodoId: periodo.periodoId,
            orden: 42,
          },
        ],
      });

      const max = await repository.getMaxOrdenInZona(
        comunidad.comunidadId,
        null,
      );

      expect(max).toBe(42);
    });

    it('returns 0 when no routes exist in zona', async () => {
      const max = await repository.getMaxOrdenInZona(9999, null);
      expect(max).toBe(0);
    });
  });
});
