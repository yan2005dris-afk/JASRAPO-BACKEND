import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';
import { Prisma } from 'src/generated/prisma/client';

import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PrismaPaymentRepository } from 'src/billing/collections/payments/infrastructure/repositories/prisma-payment.repository';
import { PaymentRepository } from 'src/billing/collections/payments/domain/repositories/payment.repository';
import { PrismaComprobanteRepository } from 'src/sri/emision/infrastructure/persistence/prisma-comprobante.repository';
import { ComprobanteRepository } from 'src/sri/emision/domain/repositories/comprobante.repository';
import { PagoValidadoHandler } from 'src/billing/collections/payments/application/pago-validado.handler';
import { ComprobanteEstado } from 'src/sri/emision/domain/constants/comprobante-estado.enum';
import { SRI_EMISION_JOB } from 'src/sri/emision/infrastructure/queue/processors/sri-emision.constants';

jest.setTimeout(180_000);

/**
 * E-007 — Concurrency scenario for PagoValidadoHandler.
 *
 * Real PrismaService against a Postgres testcontainer. Two `procesarPagoValidado`
 * invocations run in parallel; both see the comprobante as BORRADOR and both
 * try to transition it to ENVIANDO via the optimistic lock
 * (`comprobantes.updateMany WHERE estado=BORRADOR`). Postgres serializes the
 * row update so exactly one caller's `updateMany` returns count=1 and the
 * other returns count=0. Only the winner may enqueue the sri-emision job.
 *
 * Asserts:
 *  - jobsService.send is called EXACTLY once with the comprobanteId.
 *  - The comprobante ends in estado=ENVIANDO.
 *  - The losing call resolves without throwing.
 */
describe('PagoValidadoHandler — E-007 concurrent emission (integration)', () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;
  let handler: PagoValidadoHandler;
  let jobsService: { send: jest.Mock };

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16.3-alpine')
      .withDatabase('jasrapo_e2e')
      .withUsername('postgres')
      .withPassword('postgres')
      .start();

    const databaseUrl = container.getConnectionUri();

    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    jobsService = { send: jest.fn().mockResolvedValue('job-test-id') };

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
        { provide: PaymentRepository, useClass: PrismaPaymentRepository },
        {
          provide: ComprobanteRepository,
          useClass: PrismaComprobanteRepository,
        },
        {
          provide: 'JobService',
          useValue: jobsService,
        },
        PagoValidadoHandler,
      ],
    }).compile();

    prisma = module.get(PrismaService);
    handler = module.get(PagoValidadoHandler);

    await prisma.$connect();
  }, 180_000);

  afterAll(async () => {
    await prisma?.$disconnect();
    await container?.stop();
  });

  beforeEach(async () => {
    // Clean tables in FK-safe order
    await prisma.detallePago.deleteMany({});
    await prisma.pagos.deleteMany({});
    await prisma.comprobantes.deleteMany({});
    await prisma.clientes.deleteMany({});
    await prisma.catalogoFormasPago.deleteMany({});
    await prisma.sriTipoComprobante.deleteMany({});
    await prisma.puntosEmision.deleteMany({});
    await prisma.establecimientos.deleteMany({});
    await prisma.empresa.deleteMany({});

    jobsService.send.mockClear();
  });

  /**
   * Seed: emisor + establecimiento + puntoEmision + SriTipoComprobante('01') +
   * cliente + catalogoFormasPago. Returns the FK ids needed to create a comprobante.
   */
  async function seedInfraestructura() {
    const emisor = await prisma.empresa.create({
      data: {
        ruc: '1799999999001',
        razonSocial: 'Emisor Test E-007',
        direccionMatriz: 'Av. Test 123',
        ambiente: '1',
      },
    });

    const establecimiento = await prisma.establecimientos.create({
      data: {
        emisorId: emisor.id,
        codigo: '001',
        direccion: 'Av. Test 123',
      },
    });

    const puntoEmision = await prisma.puntosEmision.create({
      data: {
        establecimientoId: establecimiento.id,
        codigo: '001',
        descripcion: 'Punto Test',
      },
    });

    // SriTipoComprobante FK is required by comprobantes.tipo_comprobante.
    await prisma.sriTipoComprobante.create({
      data: { codigo: '01', nombre: 'Factura', activo: true },
    });

    const cliente = await prisma.clientes.create({
      data: {
        identificacion: '1700000001',
        nombres: 'Cliente',
        apellidos: 'Test E-007',
      },
    });

    const formaPago = await prisma.catalogoFormasPago.create({
      data: { codigo: '01', descripcion: 'Efectivo' },
    });

    return { emisor, establecimiento, puntoEmision, cliente, formaPago };
  }

  /**
   * Seed: comprobante BORRADOR with importeTotal=100 plus two pagos,
   * each with a detalle_pago of 50 → sumaAbonado = 100 = importeTotal.
   *
   * pagos + detallePago are inserted via raw SQL because the Prisma schema
   * declares `tarjeta_credito` (Pagos.tarjetaCredito) but the migrations never
   * created that column — the typed Prisma client emits `INSERT ... tarjeta_credito`
   * for nullable fields, which the testcontainer DB rejects. Raw inserts skip
   * that drift.
   */
  async function seedEscenarioConcurrente() {
    const { emisor, puntoEmision, cliente, formaPago } =
      await seedInfraestructura();

    const comprobante = await prisma.comprobantes.create({
      data: {
        emisorId: emisor.id,
        puntoEmisionId: puntoEmision.id,
        tipoComprobante: '01',
        ambiente: '1',
        tipoEmision: '1',
        secuencial: '000000001',
        fechaEmision: new Date('2026-01-01'),
        estado: ComprobanteEstado.BORRADOR,
        importeTotal: new Prisma.Decimal(100),
      },
    });

    // Raw insert pagos (the schema declares tarjeta_credito which the
    // migrations don't have — typed `prisma.pagos.create` errors out).
    const pagoInserts = await prisma.$queryRaw<Array<{ pago_id: bigint }>>`
      INSERT INTO pagos
        (cliente_id, fecha_pago, monto_total_recibido, creado_por, estado_validacion, actualizado_en)
      VALUES
        (${cliente.clienteId}, ${new Date('2026-01-01')}, 50, 'tester', 'APROBADO', NOW()),
        (${cliente.clienteId}, ${new Date('2026-01-01')}, 50, 'tester', 'APROBADO', NOW())
      RETURNING pago_id
    `;
    const pago1Id = pagoInserts[0].pago_id;
    const pago2Id = pagoInserts[1].pago_id;

    await prisma.$executeRaw`
      INSERT INTO detalle_pago
        (pago_id, comprobante_id, tipo_pago, monto_abonado, forma_pago_id)
      VALUES
        (${pago1Id}, ${comprobante.id}, 'COMPROBANTE', 50, ${formaPago.id}),
        (${pago2Id}, ${comprobante.id}, 'COMPROBANTE', 50, ${formaPago.id})
    `;

    return {
      comprobante,
      pago1: { pagoId: pago1Id },
      pago2: { pagoId: pago2Id },
    };
  }

  it('only one of two concurrent procesarPagoValidado calls enqueues the sri-emision job', async () => {
    const { comprobante, pago1, pago2 } = await seedEscenarioConcurrente();

    // Fire both in parallel — both will see the comprobante as BORRADOR and
    // race on the optimistic lock.
    const results = await Promise.allSettled([
      handler.procesarPagoValidado(pago1.pagoId),
      handler.procesarPagoValidado(pago2.pagoId),
    ]);

    // Neither call should throw.
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('fulfilled');

    // Exactly ONE job should have been enqueued (the winner).
    expect(jobsService.send).toHaveBeenCalledTimes(1);
    expect(jobsService.send).toHaveBeenCalledWith(SRI_EMISION_JOB, {
      tipo: 'FACTURA_DESDE_PREFACTURA',
      comprobanteId: comprobante.id,
    });

    // The comprobante ends in ENVIANDO, not duplicated anywhere.
    const after = await prisma.comprobantes.findUnique({
      where: { id: comprobante.id },
    });
    expect(after?.estado).toBe(ComprobanteEstado.ENVIANDO);
  });
});
