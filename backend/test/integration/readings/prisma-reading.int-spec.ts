import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { after, before, beforeEach, describe } from 'node:test';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { PrismaReadingRepository } from '../../../src/metering/readings/infrastructure/repositories/prisma-reading.repository';

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
  },
);
