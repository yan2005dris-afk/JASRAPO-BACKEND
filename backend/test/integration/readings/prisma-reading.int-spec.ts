import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { after, before, beforeEach, describe, it } from 'node:test';
import { Prisma } from '../../../src/generated/prisma/client';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { PrismaReadingRepository } from '../../../src/metering/readings/infrastructure/repositories/prisma-reading.repository';
import { EstadoPeriodo, EstadoLectura } from '../../../src/shared/enums';

void describe(
  'PrismaReadingRepository (integration)',
  { timeout: 120_000 },
  () => {
    let container: StartedPostgreSqlContainer;
    let prisma: PrismaService;
    let repository: PrismaReadingRepository;

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
      { timeout: 120_000 },
    );

    after(async () => {
      await prisma?.$disconnect();
      await container?.stop();
    });

    beforeEach(async () => {
      // Clean tables in FK-safe order
      await prisma.$executeRawUnsafe('DELETE FROM "lecturas"');
      await prisma.$executeRawUnsafe('DELETE FROM "medidores"');
      await prisma.$executeRawUnsafe('DELETE FROM "periodos"');
    });

    void describe('create + findUnique round-trip', () => {
      void it('should persist a lectura and load it back via the domain repository contract', async () => {
        // Seed mínimo: un período
        const periodo = await prisma.periodos.create({
          data: {
            nombre: 'Test Periodo',
            fechaInicio: new Date('2026-01-01'),
            fechaFin: new Date('2026-01-31'),
            fechaVencimiento: new Date('2026-02-15'),
            estado: EstadoPeriodo.ABIERTO,
          },
        });

        const medidor = await prisma.medidores.create({
          data: {
            marca: 'Test Brand',
            modelo: 'Test Model',
            serie: 'TEST-001',
          },
        });

        // Crear lectura via el contrato de dominio (CreateReadingRepositoryData)
        const created = await repository.create({
          fecha: new Date('2026-01-15'),
          lecturaAnterior: new Prisma.Decimal(100),
          lecturaActual: new Prisma.Decimal(120),
          consumoCalculado: new Prisma.Decimal(20),
          descripcionAnomalia: null,
          fechaValidacion: null,
          fotoUrl: null,
          lecturaInicial: false,
          periodoId: periodo.periodoId,
          medidorId: medidor.medidorId,
          estado: EstadoLectura.PENDIENTE,
        });

        assert.equal(typeof created.lecturaId, 'bigint');

        // Leer via el contrato de dominio (LecturaEntity)
        const found = await repository.findUnique({
          lecturaId: created.lecturaId,
        });
        assert.ok(found);
        assert.equal(found.lecturaId, created.lecturaId);
        assert.equal(found.periodoId, periodo.periodoId);
      });
    });
  },
);
