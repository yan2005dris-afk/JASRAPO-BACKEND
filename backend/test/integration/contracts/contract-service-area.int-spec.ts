import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { after, before, beforeEach, describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { PrismaContractRepository } from '../../../src/operations/contracts/infrastructure/repositories/prisma-contract.repository';
import { ContractGuideGeneratorService } from '../../../src/operations/contracts/infrastructure/services/contract-guide-generator.service';
import { CreateContractUseCase } from '../../../src/operations/contracts/application/use-cases/create-contract.use-case';
import { UpdateContractUseCase } from '../../../src/operations/contracts/application/use-cases/update-contract.use-case';
import {
  OUTSIDE_SERVICE_AREA_MESSAGE,
  SERVICE_AREA,
} from '../../../src/operations/contracts/domain/policies/service-area.policy';
import { DomainValidationException } from '../../../src/shared/domain/exceptions/domain.exception';

const OLON = { latitud: -1.7982, longitud: -80.7582 };
const OPEN_SEA = { latitud: -1.8, longitud: -80.8 };
const QUITO = { latitud: -0.2, longitud: -78.5 };

void describe(
  'Contract service area (integration)',
  { timeout: 180_000 },
  () => {
    let container: StartedPostgreSqlContainer;
    let prismaService: PrismaService;
    let createContract: CreateContractUseCase;
    let updateContract: UpdateContractUseCase;
    let clienteId: bigint;
    let categoriaTarifaId: number;
    let comunidadId: number;
    let meterCounter = 0;

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

    async function createMeterInStock(): Promise<bigint> {
      meterCounter += 1;
      const meter = await prismaService.medidores.create({
        data: {
          marca: 'Itron',
          modelo: 'CX1000',
          serie: `INT-AREA-${meterCounter}`,
        },
      });
      return meter.medidorId;
    }

    async function buildCreateDto(coordinates: {
      latitud: number;
      longitud: number;
    }) {
      return {
        clienteId: clienteId.toString(),
        categoriaTarifaId: categoriaTarifaId.toString(),
        medidorId: (await createMeterInStock()).toString(),
        comunidadId: comunidadId.toString(),
        direccionSuministro: 'Calle principal',
        ...coordinates,
      };
    }

    function assertRejectsWith(message: string) {
      return (error: unknown) => {
        assert.ok(error instanceof DomainValidationException);
        assert.equal(error.message, message);
        return true;
      };
    }

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

        prismaService = createPrismaService(databaseUrl);
        await prismaService.$connect();

        const repository = new PrismaContractRepository(
          prismaService,
          new ContractGuideGeneratorService(),
        );
        createContract = new CreateContractUseCase(repository);
        updateContract = new UpdateContractUseCase(repository);

        const cliente = await prismaService.clientes.create({
          data: {
            nombres: 'Ana',
            apellidos: 'Tomalá',
            identificacion: '0900000001',
          },
        });
        const categoria = await prismaService.categoriaTarifa.create({
          data: { nombre: 'Residencial' },
        });
        const comunidad = await prismaService.comunidades.create({
          data: {
            nombre: 'Olón',
            codigo: 'OLON',
            porcentajeTasaSeguridad: 0,
          },
        });
        clienteId = cliente.clienteId;
        categoriaTarifaId = categoria.categoriaTarifaId;
        comunidadId = comunidad.comunidadId;
      },
      { timeout: 180_000 },
    );

    after(async () => {
      await prismaService?.$disconnect();
      await container?.stop();
    });

    beforeEach(async () => {
      await prismaService.$executeRawUnsafe(
        'TRUNCATE "ordenes_trabajo", "rutas", "historial_medidores", "contratos", "medidores" RESTART IDENTITY CASCADE',
      );
    });

    void it('persists a contract located in Olón with its exact coordinates', async () => {
      const created = await createContract.execute(await buildCreateDto(OLON));

      const row = await prismaService.contratos.findUnique({
        where: { contratoId: created.contratoId },
      });
      assert.ok(row);
      assert.equal(row.latitud?.toFixed(8), '-1.79820000');
      assert.equal(row.longitud?.toFixed(8), '-80.75820000');
    });

    void it('persists a contract located on the northernmost vertex of the service area', async () => {
      const [ring] = SERVICE_AREA.geometria.coordinates;
      const [longitud, latitud] = ring.reduce((northernmost, vertex) =>
        vertex[1] > northernmost[1] ? vertex : northernmost,
      );

      const created = await createContract.execute(
        await buildCreateDto({ latitud, longitud }),
      );

      const row = await prismaService.contratos.findUnique({
        where: { contratoId: created.contratoId },
      });
      assert.ok(row);
      assert.equal(Number(row.latitud), latitud);
      assert.equal(Number(row.longitud), longitud);
    });

    void it('generates unique sequential guides for concurrent contract creation', async () => {
      const payloads = await Promise.all([
        buildCreateDto(OLON),
        buildCreateDto(OLON),
        buildCreateDto(OLON),
      ]);

      const created = await Promise.all(
        payloads.map((payload) => createContract.execute(payload)),
      );
      const guides = created.map((contract) => contract.numeroGuia);
      const values = guides
        .map((guide) => Number(guide.split('-').at(-1)))
        .sort((left, right) => left - right);

      assert.equal(new Set(guides).size, 3);
      assert.deepEqual(values, [values[0], values[0] + 1, values[0] + 2]);
      assert.ok(guides.every((guide) => guide.startsWith('OLON-INT-AREA-')));
    });

    void it('rejects a contract in the open sea without inserting it', async () => {
      const dto = await buildCreateDto(OPEN_SEA);

      await assert.rejects(
        createContract.execute(dto),
        assertRejectsWith(OUTSIDE_SERVICE_AREA_MESSAGE),
      );

      assert.equal(await prismaService.contratos.count(), 0);
      const meter = await prismaService.medidores.findUnique({
        where: { medidorId: BigInt(dto.medidorId) },
      });
      assert.equal(meter?.estado, 'BODEGA');
    });

    void it('rejects moving an existing contract outside the service area and keeps the stored location', async () => {
      const created = await createContract.execute(await buildCreateDto(OLON));

      await assert.rejects(
        updateContract.execute(created.contratoId, OPEN_SEA),
        assertRejectsWith(OUTSIDE_SERVICE_AREA_MESSAGE),
      );

      const row = await prismaService.contratos.findUnique({
        where: { contratoId: created.contratoId },
      });
      assert.ok(row);
      assert.equal(row.latitud?.toFixed(8), '-1.79820000');
      assert.equal(row.longitud?.toFixed(8), '-80.75820000');
    });

    void it('updates other fields of a legacy contract stored outside the operational area', async () => {
      const legacy = await prismaService.contratos.create({
        data: {
          clienteId,
          categoriaTarifaId,
          comunidadId,
          numeroGuia: 'GUIA-LEGADO',
          direccionSuministro: 'Dirección anterior',
          ...QUITO,
        },
      });

      await updateContract.execute(legacy.contratoId, {
        direccionSuministro: 'Dirección corregida',
        ...QUITO,
      });

      const row = await prismaService.contratos.findUnique({
        where: { contratoId: legacy.contratoId },
      });
      assert.ok(row);
      assert.equal(row.direccionSuministro, 'Dirección corregida');
      assert.equal(row.latitud?.toFixed(8), '-0.20000000');
      assert.equal(row.longitud?.toFixed(8), '-78.50000000');
    });
  },
);
