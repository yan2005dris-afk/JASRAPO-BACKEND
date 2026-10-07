import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  after,
  afterEach,
  before,
  beforeEach,
  describe,
  it,
  mock,
} from 'node:test';
import type { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '../../../src/generated/prisma/client';
import { EstadoMedidor } from '../../../src/shared/enums';
import { CreateMeterUseCase } from '../../../src/metering/meters/application/use-cases/create-meter.use-case';
import { PrismaMeterRepository } from '../../../src/metering/meters/infrastructure/repositories/prisma-meter.repository';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import type { LoggerService } from '../../../src/infrastructure/observability/logger/logger.service';
import { EntityAlreadyExistsException } from '../../../src/shared/domain/exceptions/domain.exception';
import type { MeterEntity } from '../../../src/metering/meters/domain/entities/meter.entity';

void describe('CreateMeterUseCase (integration)', { timeout: 180_000 }, () => {
  let container: StartedPostgreSqlContainer;
  let databaseUrl: string;
  let prismaService: PrismaService;
  let repository: PrismaMeterRepository;
  let useCase: CreateMeterUseCase;
  let mockLogger: {
    error: ReturnType<typeof mock.fn>;
    warn: ReturnType<typeof mock.fn>;
    log: ReturnType<typeof mock.fn>;
    debug: ReturnType<typeof mock.fn>;
  };

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
        .withDatabase('testdb')
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

      mockLogger = {
        error: mock.fn(),
        warn: mock.fn(),
        log: mock.fn(),
        debug: mock.fn(),
      };

      prismaService = createPrismaService(databaseUrl);
      await prismaService.$connect();
      repository = new PrismaMeterRepository(
        prismaService,
        mockLogger as unknown as LoggerService,
      );
      useCase = new CreateMeterUseCase(
        repository,
        mockLogger as unknown as LoggerService,
      );
    },
    { timeout: 180_000 },
  );

  afterEach(() => {
    mockLogger.error.mock.resetCalls();
    mockLogger.warn.mock.resetCalls();
    mockLogger.log.mock.resetCalls();
    mockLogger.debug.mock.resetCalls();
  });

  after(async () => {
    await prismaService?.$disconnect();
    await container?.stop();
    delete process.env.DATABASE_URL;
  });

  beforeEach(async () => {
    await prismaService.medidores.deleteMany();
  });

  void it('creates a meter with BODEGA status and persists the expected fields', async () => {
    const serie = 'INT-HAPPY-001';

    const result = await useCase.execute({
      marca: 'Itron',
      modelo: 'CX1000',
      serie,
    });

    const row = await prismaService.medidores.findUnique({ where: { serie } });

    assert.equal(result.estado, EstadoMedidor.BODEGA);
    assert.ok(row);
    assert.equal(row.estado, EstadoMedidor.BODEGA);
    assert.equal(row.serie, serie);
    assert.equal(row.codigo, null);
    assert.equal(row.marca, 'Itron');
    assert.equal(row.modelo, 'CX1000');
    assert.equal(await prismaService.medidores.count(), 1);
  });

  void it('translates one concurrent P2002 race loser into a conflict', async () => {
    const serie = 'INT-RACE-001';

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
    const row = await prismaService.medidores.findUnique({ where: { serie } });

    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(
      rejected[0].reason instanceof EntityAlreadyExistsException ||
        rejected[0].reason?.code === 'P2002',
    );
    assert.ok(row);
    assert.equal(row.serie, serie);
    assert.equal(row.estado, EstadoMedidor.BODEGA);
    assert.equal(await prismaService.medidores.count({ where: { serie } }), 1);
  });

  void it('proves the unique serie index rejects a direct duplicate with P2002', async () => {
    const serie = 'INT-INDEX-001';

    await useCase.execute({ marca: 'Itron', modelo: 'CX1000', serie });

    await assert.rejects(
      async () => {
        await prismaService.medidores.create({
          data: {
            marca: 'Other Brand',
            modelo: 'Other Model',
            serie,
          },
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof Prisma.PrismaClientKnownRequestError);
        assert.equal(error.code, 'P2002');
        return true;
      },
    );

    assert.equal(await prismaService.medidores.count({ where: { serie } }), 1);
  });

  void it('propagates non-P2002 database failures and logs an error', async () => {
    const serie = 'INT-ERROR-001';
    const brokenPrismaService = createPrismaService(
      'postgresql://invalid:invalid@localhost:54321/invalid',
    );

    const localLoggerError = mock.fn();
    const localLogger = {
      error: localLoggerError,
      warn: mock.fn(),
      log: mock.fn(),
      debug: mock.fn(),
    } as unknown as LoggerService;

    const brokenRepo = new PrismaMeterRepository(
      brokenPrismaService,
      localLogger,
    );
    const brokenUseCase = new CreateMeterUseCase(brokenRepo, localLogger);

    await assert.rejects(
      async () => {
        await brokenUseCase.execute({
          marca: 'Itron',
          modelo: 'CX1000',
          serie,
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof Error);
        return true;
      },
    );

    assert.equal(localLoggerError.mock.callCount(), 1);
    assert.equal(
      localLoggerError.mock.calls[0].arguments[0],
      `Failed to create meter with serial ${serie}`,
    );
    assert.equal(
      localLoggerError.mock.calls[0].arguments[2],
      CreateMeterUseCase.name,
    );
    assert.equal(await prismaService.medidores.count({ where: { serie } }), 0);
  });
});
