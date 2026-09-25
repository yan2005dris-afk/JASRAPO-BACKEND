import type { ConfigService } from '@nestjs/config';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execFileSync } from 'node:child_process';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PrismaOrdenTrabajoRepository } from './prisma-orden-trabajo.repository';

jest.setTimeout(180_000);

describe('Installation lifecycle persistence', () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;
  let repository: PrismaOrdenTrabajoRepository;
  let sequence = 0;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16.3-alpine')
      .withDatabase('installation_test')
      .withUsername('test')
      .withPassword('test')
      .start();
    const databaseUrl = container.getConnectionUri();

    execFileSync(
      process.execPath,
      [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'],
      {
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: 'pipe',
      },
    );

    prisma = new PrismaService({
      getOrThrow: () => databaseUrl,
    } as unknown as ConfigService);
    await prisma.$connect();
    repository = new PrismaOrdenTrabajoRepository(prisma);
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    await container?.stop();
  });

  async function fixture(activity = 'INSTALACION') {
    const suffix = String(++sequence);
    const client = await prisma.clientes.create({
      data: {
        nombres: 'Prueba',
        apellidos: 'Instalación',
        identificacion: `installation-${suffix}`,
      },
    });
    const community = await prisma.comunidades.create({
      data: {
        nombre: 'Prueba',
        codigo: `installation-${suffix}`,
        porcentajeTasaSeguridad: 0,
      },
    });
    const tariff = await prisma.categoriaTarifa.create({
      data: { nombre: 'Prueba' },
    });
    const contract = await prisma.contratos.create({
      data: {
        clienteId: client.clienteId,
        comunidadId: community.comunidadId,
        categoriaTarifaId: tariff.categoriaTarifaId,
        numeroGuia: `installation-${suffix}`,
        direccionSuministro: 'Prueba',
        estadoServicio:
          activity === 'INSTALACION' ? 'PENDIENTE_INSTALACION' : 'SUSPENDIDO',
        estadoCobranza: 'NO_APLICA',
      },
    });
    const meter = await prisma.medidores.create({
      data: {
        marca: 'Prueba',
        modelo: 'Prueba',
        serie: `installation-${suffix}`,
        estado: activity === 'INSTALACION' ? 'PENDIENTE' : 'INSTALADO',
        fechaInstalacion:
          activity === 'INSTALACION' ? null : new Date('2025-01-01T00:00:00Z'),
      },
    });
    const history = await prisma.historialMedidores.create({
      data: {
        contratoId: contract.contratoId,
        medidorId: meter.medidorId,
        lecturaInicial: 0,
      },
    });
    const type = await prisma.tipoActividad.upsert({
      where: { codigo: activity },
      create: { codigo: activity, nombre: activity },
      update: {},
    });
    const route = await prisma.rutas.create({
      data: {
        nombre: `Instalación ${suffix}`,
        comunidadId: community.comunidadId,
        tipoActividadId: type.tipoActividadId,
      },
    });
    const order = await prisma.ordenesTrabajo.create({
      data: {
        rutaId: route.rutaId,
        contratoId: contract.contratoId,
        medidorId: meter.medidorId,
      },
    });
    return { contract, meter, history, order };
  }

  async function readState(data: Awaited<ReturnType<typeof fixture>>) {
    const [contract, meter, order] = await Promise.all([
      prisma.contratos.findUniqueOrThrow({
        where: { contratoId: data.contract.contratoId },
      }),
      prisma.medidores.findUniqueOrThrow({
        where: { medidorId: data.meter.medidorId },
      }),
      prisma.ordenesTrabajo.findUniqueOrThrow({
        where: { ordenTrabajoId: data.order.ordenTrabajoId },
      }),
    ]);
    return { contract, meter, order };
  }

  it.each(['updateEstado', 'updateOperatorWorkOrder'] as const)(
    'persists installation atomically and preserves its date on retry through %s',
    async (method) => {
      const data = await fixture();
      const startedAt = Date.now();

      await repository[method](data.order.ordenTrabajoId, {
        estado: 'COMPLETADA',
      });

      const first = await readState(data);
      expect(first.contract.estadoServicio).toBe('ACTIVO');
      expect(first.contract.estadoCobranza).toBe('AL_DIA');
      expect(first.meter.estado).toBe('INSTALADO');
      expect(first.meter.fechaInstalacion?.getTime()).toBeGreaterThanOrEqual(
        startedAt,
      );
      expect(first.meter.fechaInstalacion?.getTime()).toBeLessThanOrEqual(
        Date.now(),
      );
      expect(first.order.estado).toBe('COMPLETADA');

      await repository[method](data.order.ordenTrabajoId, {
        estado: 'COMPLETADA',
      });
      expect((await readState(data)).meter.fechaInstalacion).toEqual(
        first.meter.fechaInstalacion,
      );
    },
  );

  it.each(['BODEGA', 'DANADO', 'BAJA', 'INSTALADO'] as const)(
    'rejects a meter in %s without activating the contract',
    async (estado) => {
      const data = await fixture();
      await prisma.medidores.update({
        where: { medidorId: data.meter.medidorId },
        data: { estado },
      });

      await expect(
        repository.updateEstado(data.order.ordenTrabajoId, {
          estado: 'COMPLETADA',
        }),
      ).rejects.toThrow('pendiente y vinculado');

      const result = await readState(data);
      expect(result.contract.estadoServicio).toBe('PENDIENTE_INSTALACION');
      expect(result.order.estado).toBe('PENDIENTE');
      expect(result.meter.estado).toBe(estado);
      expect(result.meter.fechaInstalacion).toBeNull();
    },
  );

  it('rejects a meter whose contract link has ended', async () => {
    const data = await fixture();
    await prisma.historialMedidores.update({
      where: { historialId: data.history.historialId },
      data: { fechaHasta: new Date() },
    });

    await expect(
      repository.updateEstado(data.order.ordenTrabajoId, {
        estado: 'COMPLETADA',
      }),
    ).rejects.toThrow('pendiente y vinculado');
    const result = await readState(data);
    expect(result.meter.estado).toBe('PENDIENTE');
    expect(result.contract.estadoServicio).toBe('PENDIENTE_INSTALACION');
    expect(result.order.estado).toBe('PENDIENTE');
  });

  it('rolls back meter and contract changes when saving the order fails', async () => {
    const data = await fixture();

    await expect(
      repository.updateOperatorWorkOrder(data.order.ordenTrabajoId, {
        estado: 'COMPLETADA',
        completadoEn: new Date('invalid'),
      }),
    ).rejects.toThrow();

    const result = await readState(data);
    expect(result.meter.estado).toBe('PENDIENTE');
    expect(result.meter.fechaInstalacion).toBeNull();
    expect(result.contract.estadoServicio).toBe('PENDIENTE_INSTALACION');
    expect(result.contract.estadoCobranza).toBe('NO_APLICA');
    expect(result.order.estado).toBe('PENDIENTE');
  });

  it('preserves the original installation date when reconnecting service', async () => {
    const data = await fixture('RECONEXION');
    await repository.updateEstado(data.order.ordenTrabajoId, {
      estado: 'COMPLETADA',
    });

    const result = await readState(data);
    expect(result.contract.estadoServicio).toBe('ACTIVO');
    expect(result.meter.estado).toBe('INSTALADO');
    expect(result.meter.fechaInstalacion).toEqual(data.meter.fechaInstalacion);
  });
});
