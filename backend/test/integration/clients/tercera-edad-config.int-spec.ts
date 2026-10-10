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
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SistemaConfigRepository } from 'src/infrastructure/config/sistema-config.repository';
import {
  SistemaConfigService,
  __resetSistemaConfigCache,
} from 'src/infrastructure/config/sistema-config.service';
import { CLIENTES_TERCERA_EDAD_EDAD_MINIMA } from 'src/infrastructure/config/sistema-config.keys';
import { TerceraEdadService } from 'src/operations/clients/application/services/tercera-edad.service';
import { CreateClientUseCase } from 'src/operations/clients/application/use-cases/create-client.use-case';
import { UpdateClientUseCase } from 'src/operations/clients/application/use-cases/update-client.use-case';
import { PrismaClientRepository } from 'src/operations/clients/infrastructure/repositories/prisma-client.repository';
import type { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { seedTerceraEdadConfig } from '../../../prisma/schema/seeds/terceraEdadConfig.seed';

void describe(
  'TerceraEdad Integration Flow (Real DB & SistemaConfig)',
  { timeout: 180_000 },
  () => {
    let container: StartedPostgreSqlContainer;
    let databaseUrl: string;
    let prismaService: PrismaService;
    let configServiceMock: ConfigService;
    let configRepository: SistemaConfigRepository;
    let sistemaConfigService: SistemaConfigService;
    let terceraEdadService: TerceraEdadService;
    let clientRepository: PrismaClientRepository;
    let createClientUseCase: CreateClientUseCase;
    let updateClientUseCase: UpdateClientUseCase;

    const mockLogger = {
      error: mock.fn(),
      warn: mock.fn(),
      log: mock.fn(),
      debug: mock.fn(),
    } as unknown as LoggerService;

    function createPrismaService(url: string): PrismaService {
      const config = {
        getOrThrow: (key: string) => {
          if (key === 'DATABASE_URL') return url;
          throw new Error(`Unknown key: ${key}`);
        },
        get: (key: string) => {
          if (key === 'DATABASE_URL') return url;
          return undefined;
        },
      } as unknown as ConfigService;
      return new PrismaService(config);
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

        prismaService = createPrismaService(databaseUrl);
        await prismaService.$connect();

        configServiceMock = {
          get: (key: string, defaultVal: any) => {
            if (key === 'SISTEMA_CONFIG_CACHE_TTL_MS') return 100; // 100ms for testing cache eviction
            return defaultVal;
          },
        } as unknown as ConfigService;

        configRepository = new SistemaConfigRepository(prismaService);
        sistemaConfigService = new SistemaConfigService(
          configRepository,
          configServiceMock,
        );
        terceraEdadService = new TerceraEdadService(
          mockLogger,
          sistemaConfigService,
        );
        clientRepository = new PrismaClientRepository(prismaService);
        createClientUseCase = new CreateClientUseCase(
          clientRepository,
          terceraEdadService,
        );
        updateClientUseCase = new UpdateClientUseCase(
          clientRepository,
          terceraEdadService,
        );
      },
      { timeout: 180_000 },
    );

    afterEach(() => {
      __resetSistemaConfigCache();
    });

    after(async () => {
      await prismaService?.$disconnect();
      await container?.stop();
      delete process.env.DATABASE_URL;
    });

    beforeEach(async () => {
      await prismaService.contratos.deleteMany();
      await prismaService.clientes.deleteMany();
      await prismaService.sistemaConfig.deleteMany();
    });

    void it('seeds initial default config of 65 and correctly applies benefit on create client', async () => {
      await seedTerceraEdadConfig(prismaService);

      const configRow = await prismaService.sistemaConfig.findUnique({
        where: { clave: CLIENTES_TERCERA_EDAD_EDAD_MINIMA },
      });
      assert.ok(configRow);
      assert.equal(configRow.valor, '65');

      const thisYear = new Date().getFullYear();
      // Client 1: 67 years old -> should be true
      const clientSenior = await createClientUseCase.execute({
        tipoIdentificacionId: 1, // Cedula
        identificacion: '0926715658',
        nombres: 'ANCIANO',
        apellidos: 'BENEFICIARIO',
        fechaNacimiento: `${thisYear - 67}-05-10`,
        direccionDomicilio: 'Calle 1 y 2',
      });
      assert.equal(clientSenior.aplicaTerceraEdad, true);

      // Client 2: 62 years old -> should be false with threshold 65
      const clientNonSenior = await createClientUseCase.execute({
        tipoIdentificacionId: 1,
        identificacion: '0926715666',
        nombres: 'ADULTO',
        apellidos: 'REGULAR',
        fechaNacimiento: `${thisYear - 62}-05-10`,
        direccionDomicilio: 'Calle 3 y 4',
      });
      assert.equal(clientNonSenior.aplicaTerceraEdad, false);

      const dbSenior = await prismaService.clientes.findUnique({
        where: { clienteId: clientSenior.clienteId },
      });
      assert.equal(dbSenior?.aplicaTerceraEdad, true);

      const dbNonSenior = await prismaService.clientes.findUnique({
        where: { clienteId: clientNonSenior.clienteId },
      });
      assert.equal(dbNonSenior?.aplicaTerceraEdad, false);
    });

    void it('recalculates on update client when threshold in sistema_config changes to 60', async () => {
      await prismaService.sistemaConfig.create({
        data: {
          clave: CLIENTES_TERCERA_EDAD_EDAD_MINIMA,
          valor: '65',
        },
      });

      const thisYear = new Date().getFullYear();
      const birthDate = `${thisYear - 62}-01-01`; // 62 years old

      const client = await createClientUseCase.execute({
        tipoIdentificacionId: 1,
        identificacion: '0926715658',
        nombres: 'CARLOS',
        apellidos: 'MENDOZA',
        fechaNacimiento: birthDate,
        direccionDomicilio: 'Sector Central',
      });
      assert.equal(client.aplicaTerceraEdad, false);

      // Update config threshold in database to 60
      await sistemaConfigService.update(CLIENTES_TERCERA_EDAD_EDAD_MINIMA, {
        valor: '60',
      });

      // Update client with birth date -> now 62 >= 60, should be true
      const updatedClient = await updateClientUseCase.execute(
        client.clienteId,
        {
          fechaNacimiento: birthDate,
        },
      );
      assert.equal(updatedClient.aplicaTerceraEdad, true);

      const dbRow = await prismaService.clientes.findUnique({
        where: { clienteId: client.clienteId },
      });
      assert.equal(dbRow?.aplicaTerceraEdad, true);
    });

    void it('gracefully uses fallback 65 when config is deleted or invalid', async () => {
      // No config in DB
      const thisYear = new Date().getFullYear();
      const clientSenior = await createClientUseCase.execute({
        tipoIdentificacionId: 1,
        identificacion: '0926715658',
        nombres: 'MARIA',
        apellidos: 'GOMEZ',
        fechaNacimiento: `${thisYear - 66}-01-01`,
        direccionDomicilio: 'Calle Principal',
      });
      assert.equal(clientSenior.aplicaTerceraEdad, true);

      const clientYounger = await createClientUseCase.execute({
        tipoIdentificacionId: 1,
        identificacion: '0926715666',
        nombres: 'LUCIA',
        apellidos: 'GOMEZ',
        fechaNacimiento: `${thisYear - 64}-01-01`,
        direccionDomicilio: 'Calle Principal',
      });
      assert.equal(clientYounger.aplicaTerceraEdad, false);
    });
  },
);
