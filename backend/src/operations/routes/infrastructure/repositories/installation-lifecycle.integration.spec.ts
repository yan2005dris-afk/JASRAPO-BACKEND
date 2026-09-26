import { Client } from 'pg';
import { PrismaContractRepository } from 'src/operations/contracts/infrastructure/repositories/prisma-contract.repository';
import { PrismaPaymentRepository } from 'src/billing/collections/payments/infrastructure/repositories/prisma-payment.repository';
import { PrismaRouteRepository } from './prisma-route.repository';
import type { CreateContractWithMeterCommand } from 'src/operations/contracts/domain/types/contract.types';
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
    const seed = new Client({ connectionString: databaseUrl });
    await seed.connect();
    try {
      await seed.query(`
        INSERT INTO sri_tipo_comprobante(codigo, nombre) VALUES ('01', 'Factura');
        INSERT INTO catalogo_impuestos(codigo, nombre, activo, created_at, updated_at)
        VALUES ('99', 'Test tax', true, now(), now());
        INSERT INTO catalogo_tarifas_impuesto(impuesto_id, codigo_porcentaje, descripcion, porcentaje, vigente_desde, activo, created_at, updated_at)
        VALUES ((SELECT id FROM catalogo_impuestos WHERE codigo='99'), '0', 'Zero', 0, '2026-01-01', true, now(), now());
        INSERT INTO emisores(ruc, razon_social, direccion_matriz, created_at, updated_at)
        VALUES ('9999999999001', 'Test issuer', 'Test', now(), now());
        INSERT INTO establecimientos(emisor_id, codigo, direccion, created_at)
        VALUES ((SELECT id FROM emisores WHERE ruc='9999999999001'), '001', 'Test', now());
        INSERT INTO puntos_emision(establecimiento_id, codigo, created_at)
        VALUES ((SELECT id FROM establecimientos WHERE codigo='001'), '001', now());
        INSERT INTO periodos(nombre, fecha_inicio, fecha_fin, fecha_vencimiento, creado_en, actualizado_en)
        VALUES ('Test', '2026-01-01', '2026-12-31', '2027-01-15', now(), now());
      `);
    } finally {
      await seed.end();
    }
    for (const codigo of ['INSPECCION', 'INSTALACION']) {
      await prisma.tipoActividad.upsert({
        where: { codigo },
        create: { codigo, nombre: codigo },
        update: { activo: true },
      });
    }
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
  async function registration(): Promise<CreateContractWithMeterCommand> {
    const suffix = `inspection-${++sequence}`;
    const client = await prisma.clientes.create({
      data: { nombres: 'Test', apellidos: 'Test', identificacion: suffix },
    });
    const community = await prisma.comunidades.create({
      data: { nombre: suffix, codigo: suffix, porcentajeTasaSeguridad: 0 },
    });
    const tariff = await prisma.categoriaTarifa.create({
      data: { nombre: suffix },
    });
    const tax = await prisma.catalogoTarifasImpuesto.findFirstOrThrow();
    await prisma.rubros.create({
      data: {
        nombre: 'Installation',
        descripcion: 'Installation',
        precioUnitario: 100,
        tipoRubro: 'SERVICIO',
        categoriaTarifaId: tariff.categoriaTarifaId,
        tarifaImpuestoId: tax.id,
        codigoSistemaRubro: 'INSTALACION',
      },
    });
    const meter = await prisma.medidores.create({
      data: { marca: 'Test', modelo: 'Test', serie: suffix, estado: 'BODEGA' },
    });
    return {
      clienteId: client.clienteId,
      categoriaTarifaId: tariff.categoriaTarifaId,
      comunidadId: community.comunidadId,
      medidorId: meter.medidorId,
      sectorId: null,
      numeroGuia: suffix,
      direccionSuministro: 'Test',
      estadoServicio: 'PENDIENTE_INSPECCION',
      estadoCobranza: 'NO_APLICA',
      lecturaInicial: 10,
    };
  }

  async function createRegistration() {
    const command = await registration();
    const contract = await new PrismaContractRepository(
      prisma,
    ).createContractWithMeterHistory(command);
    const order = await prisma.ordenesTrabajo.findFirstOrThrow({
      where: { contratoId: contract.contratoId },
    });
    return { command, contract, order };
  }

  it.each(['updateEstado', 'updateOperatorWorkOrder'] as const)(
    'runs inspection, payment and installation through %s without duplicate charges or orders',
    async (method) => {
      const { command, contract, order } = await createRegistration();
      expect(contract.estadoServicio).toBe('PENDIENTE_INSPECCION');
      expect(contract.estadoCobranza).toBe('NO_APLICA');
      expect(
        await prisma.prefacturas.count({
          where: { contratoId: contract.contratoId },
        }),
      ).toBe(0);
      expect(
        (
          await prisma.medidores.findUniqueOrThrow({
            where: { medidorId: command.medidorId },
          })
        ).estado,
      ).toBe('PENDIENTE');
      await Promise.all([
        repository[method](order.ordenTrabajoId, { estado: 'COMPLETADA' }),
        repository[method](order.ordenTrabajoId, { estado: 'COMPLETADA' }),
      ]);
      const invoices = await prisma.prefacturas.findMany({
        where: { contratoId: contract.contratoId },
      });
      expect(invoices).toHaveLength(1);
      expect(
        (
          await prisma.contratos.findUniqueOrThrow({
            where: { contratoId: contract.contratoId },
          })
        ).estadoServicio,
      ).toBe('PENDIENTE_PAGO');
      expect(
        (
          await prisma.medidores.findUniqueOrThrow({
            where: { medidorId: command.medidorId },
          })
        ).estado,
      ).toBe('PENDIENTE');
      const payments = new PrismaPaymentRepository(prisma);
      await Promise.all([
        payments.settlePaidComprobante(invoices[0].comprobanteId!, 100),
        payments.settlePaidComprobante(invoices[0].comprobanteId!, 100),
      ]);
      const installation = await prisma.ordenesTrabajo.findMany({
        where: {
          contratoId: contract.contratoId,
          ruta: { tipoActividad: { codigo: 'INSTALACION' } },
        },
      });
      expect(installation).toHaveLength(1);
      expect(
        (
          await prisma.contratos.findUniqueOrThrow({
            where: { contratoId: contract.contratoId },
          })
        ).estadoServicio,
      ).toBe('PENDIENTE_INSTALACION');
      expect(
        await repository.assignInstallationRoute(contract.contratoId),
      ).toBe(installation[0].rutaId);
      const route = await prisma.rutas.create({
        data: {
          nombre: 'Assigned',
          comunidadId: command.comunidadId,
          tipoActividadId: (
            await prisma.tipoActividad.findUniqueOrThrow({
              where: { codigo: 'INSTALACION' },
            })
          ).tipoActividadId,
        },
      });
      await repository.assignInstallationRoute(
        contract.contratoId,
        route.rutaId,
      );
      await new PrismaRouteRepository(prisma).createWorkOrdersForContracts(
        route.rutaId,
        [Number(contract.contratoId)],
      );
      expect(
        await prisma.ordenesTrabajo.count({
          where: {
            contratoId: contract.contratoId,
            ruta: { tipoActividad: { codigo: 'INSTALACION' } },
          },
        }),
      ).toBe(1);
      await repository[method](installation[0].ordenTrabajoId, {
        estado: 'COMPLETADA',
      });
      const active = await prisma.contratos.findUniqueOrThrow({
        where: { contratoId: contract.contratoId },
      });
      expect(active.estadoServicio).toBe('ACTIVO');
      expect(active.estadoCobranza).toBe('AL_DIA');
      const installed = await prisma.medidores.findUniqueOrThrow({
        where: { medidorId: command.medidorId },
      });
      expect(installed.estado).toBe('INSTALADO');
      expect(installed.fechaInstalacion).not.toBeNull();
      await expect(
        repository[method](installation[0].ordenTrabajoId, {
          estado: 'PENDIENTE',
        }),
      ).rejects.toThrow();
      await expect(
        repository[method](order.ordenTrabajoId, { estado: 'CANCELADA' }),
      ).rejects.toThrow();
    },
  );

  it.each(['updateEstado', 'updateOperatorWorkOrder'] as const)(
    'rejects inspection and releases the meter without debt through %s',
    async (method) => {
      const { command, contract, order } = await createRegistration();
      await repository[method](order.ordenTrabajoId, { estado: 'CANCELADA' });
      await repository[method](order.ordenTrabajoId, { estado: 'CANCELADA' });
      const rejected = await prisma.contratos.findUniqueOrThrow({
        where: { contratoId: contract.contratoId },
      });
      expect(rejected.estadoServicio).toBe('RECHAZADO');
      expect(rejected.estadoCobranza).toBe('NO_APLICA');
      expect(
        await prisma.prefacturas.count({
          where: { contratoId: contract.contratoId },
        }),
      ).toBe(0);
      expect(
        (
          await prisma.medidores.findUniqueOrThrow({
            where: { medidorId: command.medidorId },
          })
        ).estado,
      ).toBe('BODEGA');
      expect(
        await prisma.historialMedidores.count({
          where: { contratoId: contract.contratoId, fechaHasta: null },
        }),
      ).toBe(0);
      await expect(
        repository[method](order.ordenTrabajoId, { estado: 'COMPLETADA' }),
      ).rejects.toThrow();
      const next = await new PrismaContractRepository(
        prisma,
      ).createContractWithMeterHistory({
        ...command,
        numeroGuia: `${command.numeroGuia}-retry`,
      });
      expect(next.estadoServicio).toBe('PENDIENTE_INSPECCION');
    },
  );

  it('rolls back inspection approval if billing fails', async () => {
    const { command, contract, order } = await createRegistration();
    await prisma.rubros.updateMany({
      where: { categoriaTarifaId: command.categoriaTarifaId },
      data: { activo: false },
    });
    await expect(
      repository.updateEstado(order.ordenTrabajoId, { estado: 'COMPLETADA' }),
    ).rejects.toThrow();
    expect(
      (
        await prisma.contratos.findUniqueOrThrow({
          where: { contratoId: contract.contratoId },
        })
      ).estadoServicio,
    ).toBe('PENDIENTE_INSPECCION');
    expect(
      (
        await prisma.ordenesTrabajo.findUniqueOrThrow({
          where: { ordenTrabajoId: order.ordenTrabajoId },
        })
      ).estado,
    ).toBe('PENDIENTE');
    expect(
      await prisma.prefacturas.count({
        where: { contratoId: contract.contratoId },
      }),
    ).toBe(0);
  });

  it('reserves a meter only once under concurrent registrations', async () => {
    const command = await registration();
    const contracts = new PrismaContractRepository(prisma);
    const results = await Promise.allSettled([
      contracts.createContractWithMeterHistory(command),
      contracts.createContractWithMeterHistory({
        ...command,
        numeroGuia: `${command.numeroGuia}-other`,
      }),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      await prisma.historialMedidores.count({
        where: { medidorId: command.medidorId, fechaHasta: null },
      }),
    ).toBe(1);
  });

  it('rolls back registration and reservation if inspection cannot be generated', async () => {
    const command = await registration();
    await prisma.tipoActividad.update({
      where: { codigo: 'INSPECCION' },
      data: { activo: false },
    });
    try {
      await expect(
        new PrismaContractRepository(prisma).createContractWithMeterHistory(
          command,
        ),
      ).rejects.toThrow();
      expect(
        await prisma.contratos.count({
          where: { numeroGuia: command.numeroGuia },
        }),
      ).toBe(0);
      expect(
        (
          await prisma.medidores.findUniqueOrThrow({
            where: { medidorId: command.medidorId },
          })
        ).estado,
      ).toBe('BODEGA');
    } finally {
      await prisma.tipoActividad.update({
        where: { codigo: 'INSPECCION' },
        data: { activo: true },
      });
    }
  });
  it('rolls back payment settlement when installation scheduling fails', async () => {
    const { contract, order } = await createRegistration();
    await repository.updateEstado(order.ordenTrabajoId, {
      estado: 'COMPLETADA',
    });
    const invoice = await prisma.prefacturas.findFirstOrThrow({
      where: { contratoId: contract.contratoId },
    });
    await prisma.tipoActividad.update({
      where: { codigo: 'INSTALACION' },
      data: { activo: false },
    });
    try {
      await expect(
        new PrismaPaymentRepository(prisma).settlePaidComprobante(
          invoice.comprobanteId!,
          100,
        ),
      ).rejects.toThrow();
      expect(
        (
          await prisma.contratos.findUniqueOrThrow({
            where: { contratoId: contract.contratoId },
          })
        ).estadoServicio,
      ).toBe('PENDIENTE_PAGO');
      expect(
        (
          await prisma.prefacturas.findUniqueOrThrow({
            where: { prefacturaId: invoice.prefacturaId },
          })
        ).estado,
      ).toBe(invoice.estado);
      expect(
        await prisma.ordenesTrabajo.count({
          where: { contratoId: contract.contratoId },
        }),
      ).toBe(1);
    } finally {
      await prisma.tipoActividad.update({
        where: { codigo: 'INSTALACION' },
        data: { activo: true },
      });
    }
  });
});
