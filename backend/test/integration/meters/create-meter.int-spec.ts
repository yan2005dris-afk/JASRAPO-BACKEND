import { ConflictException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execFileSync } from 'node:child_process';
import { Prisma, PrismaClient } from 'src/generated/prisma/client';
import { EstadoMedidor } from 'src/shared/enums';
import { CreateMeterUseCase } from 'src/metering/meters/application/use-cases/create-meter.use-case';
import { MeterRepository } from 'src/metering/meters/domain/repositories/meter.repository';
import type { MeterEntity } from 'src/metering/meters/domain/entities/meter.entity';
import { PrismaMeterRepository } from 'src/metering/meters/infrastructure/repositories/prisma-meter.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

jest.setTimeout(180_000);

describe('CreateMeterUseCase (integration)', () => {
  let container: StartedPostgreSqlContainer;
  let databaseUrl: string;
  let prisma: PrismaClient;
  let useCase: CreateMeterUseCase;

  function createPrismaClient(url: string): PrismaClient {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: url }),
    });
  }

  async function buildUseCase(
    client: PrismaClient,
  ): Promise<CreateMeterUseCase> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateMeterUseCase,
        {
          provide: MeterRepository,
          useClass: PrismaMeterRepository,
        },
        {
          provide: PrismaService,
          useValue: client,
        },
      ],
    }).compile();

    return moduleRef.get(CreateMeterUseCase);
  }

  function duplicateMessage(serie: string): string {
    return `Ya existe un medidor registrado con el número de serie "${serie}".`;
  }

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16.3-alpine')
      .withDatabase('testdb')
      .withUsername('test')
      .withPassword('test')
      .start();

    databaseUrl = container.getConnectionUri();
    process.env.DATABASE_URL = databaseUrl;

    execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    });

    prisma = createPrismaClient(databaseUrl);
    await prisma.$connect();
    useCase = await buildUseCase(prisma);
  }, 180_000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    await container?.stop();
    delete process.env.DATABASE_URL;
  });

  beforeEach(async () => {
    await prisma.medidores.deleteMany();
  });

  it('creates a meter with BODEGA status and persists the expected fields', async () => {
    const serie = 'INT-HAPPY-001';

    const result = await useCase.execute({
      marca: 'Itron',
      modelo: 'CX1000',
      serie,
    });

    const row = await prisma.medidores.findUnique({ where: { serie } });

    expect(result.estado).toBe(EstadoMedidor.BODEGA);
    expect(row).toMatchObject({
      estado: EstadoMedidor.BODEGA,
      serie,
      marca: 'Itron',
      modelo: 'CX1000',
    });
    expect(await prisma.medidores.count()).toBe(1);
  });

  it('translates one concurrent P2002 race loser into a conflict', async () => {
    const serie = 'INT-RACE-001';
    const loggerWarn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    const results = await Promise.allSettled([
      useCase.execute({ marca: 'Itron', modelo: 'CX1000', serie }),
      useCase.execute({ marca: 'Itron', modelo: 'CX1000', serie }),
    ]);
    const fulfilled = results.filter(
      (result): result is PromiseFulfilledResult<MeterEntity> =>
        result.status === 'fulfilled',
    );
    const rejected = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    const row = await prisma.medidores.findUnique({ where: { serie } });

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(ConflictException);
    expect(rejected[0].reason.message).toBe(duplicateMessage(serie));
    expect(row).toMatchObject({ serie, estado: EstadoMedidor.BODEGA });
    expect(await prisma.medidores.count({ where: { serie } })).toBe(1);
    expect(loggerWarn).toHaveBeenCalledTimes(1);
    expect(loggerWarn).toHaveBeenCalledWith(
      `Duplicate meter creation attempt for serial ${serie}`,
    );
  });

  it('proves the unique serie index rejects a direct duplicate with P2002', async () => {
    const serie = 'INT-INDEX-001';

    await useCase.execute({ marca: 'Itron', modelo: 'CX1000', serie });

    try {
      await prisma.medidores.create({
        data: {
          marca: 'Other Brand',
          modelo: 'Other Model',
          serie,
        },
      });
      throw new Error('Expected duplicate meter creation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect(error).toMatchObject({ code: 'P2002' });
    }

    expect(await prisma.medidores.count({ where: { serie } })).toBe(1);
  });

  it('propagates non-P2002 database failures and logs an error', async () => {
    const serie = 'INT-ERROR-001';
    const brokenPrisma = createPrismaClient(databaseUrl);
    await brokenPrisma.$connect();
    const brokenUseCase = await buildUseCase(brokenPrisma);
    await brokenPrisma.$disconnect();

    const loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(
      brokenUseCase.execute({ marca: 'Itron', modelo: 'CX1000', serie }),
    ).rejects.toBeInstanceOf(Error);

    expect(loggerError).toHaveBeenCalledWith(
      `Failed to create meter with serial ${serie}`,
      expect.any(String),
      CreateMeterUseCase.name,
    );
    expect(await prisma.medidores.count({ where: { serie } })).toBe(0);
  });
});
