import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'src/generated/prisma/client';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PrismaReadingRepository } from 'src/metering/readings/infrastructure/repositories/prisma-reading.repository';
import { EstadoPeriodo, EstadoLectura } from 'src/shared/enums';
import { execSync } from 'node:child_process';

jest.setTimeout(120_000);

describe('PrismaReadingRepository (integration)', () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;
  let repository: PrismaReadingRepository;

  beforeAll(async () => {
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
        PrismaReadingRepository,
      ],
    }).compile();

    prisma = module.get(PrismaService);
    repository = module.get(PrismaReadingRepository);

    await prisma.$connect();
  }, 120_000);

  afterAll(async () => {
    await prisma?.$disconnect();
    await container?.stop();
  });

  beforeEach(async () => {
    // Clean tables in FK-safe order
    await prisma.$executeRawUnsafe('DELETE FROM "lecturas"');
    await prisma.$executeRawUnsafe('DELETE FROM "periodos"');
  });

  describe('create + findUnique round-trip', () => {
    it('should persist a lectura and load it back via the domain repository contract', async () => {
      // Seed mínimo: un período
      const periodo = await prisma.periodos.create({
        data: {
          nombre: 'Test Periodo',
          fechaInicio: new Date('2026-01-01'),
          fechaFin: new Date('2026-01-31'),
          estado: EstadoPeriodo.ABIERTO,
        } as Prisma.PeriodosUncheckedCreateInput,
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
        medidorId: 1, // FK flexible; verificamos el round-trip del contrato
        estado: EstadoLectura.PENDIENTE as Prisma.LecturasCreateInput['estado'],
      } as never);

      expect(created).toBeDefined();
      expect(created.lecturaId).toEqual(expect.any(BigInt));

      // Leer via el contrato de dominio (LecturaEntity)
      const found = await repository.findUnique({
        lecturaId: created.lecturaId,
      });
      expect(found).not.toBeNull();
      expect(found?.lecturaId).toEqual(created.lecturaId);
      expect(found?.periodoId).toEqual(periodo.periodoId);
    });
  });
});
