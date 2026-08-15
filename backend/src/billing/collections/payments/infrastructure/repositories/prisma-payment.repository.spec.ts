import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaPaymentRepository } from './prisma-payment.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

describe('PrismaPaymentRepository', () => {
  let repository: PrismaPaymentRepository;

  const rawPayment = {
    pagoId: 1n,
    clienteId: 10n,
    cajaId: 5n,
    banco: 'PICHINCHA' as const,
    tarjetaCredito: null,
    comprobanteUrl: null,
    fechaPago: new Date('2026-06-18T00:00:00.000Z'),
    montoTotalRecibido: new Prisma.Decimal(150),
    numeroOperacion: 'TRX-123',
    observaciones: 'Pago test',
    referenciaBanco: null,
    estadoPago: 'REGISTRADO' as const,
    creadoPor: 'admin',
    anuladoPor: null,
    fechaAnulacion: null,
    motivoAnulacion: null,
    createdAt: new Date('2026-06-18T00:00:00.000Z'),
    updatedAt: new Date('2026-06-18T00:00:00.000Z'),
    deletedAt: null,
    detallePago: [],
    saldosFavor: [],
  };

  const rawSaldo = {
    saldoFavorId: 1n,
    clienteId: 10n,
    pagoId: 1n,
    montoSaldo: new Prisma.Decimal(25),
    tipoOrigen: 'PAGO_EXCESO',
    disponibleParaAplicar: true,
    createdAt: new Date('2026-06-18T00:00:00.000Z'),
    updatedAt: new Date('2026-06-18T00:00:00.000Z'),
    deletedAt: null,
  };

  const prismaMock = {
    pagos: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    detallePago: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
    },
    saldoFavorCliente: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    clientes: {
      count: jest.fn(),
    },
    cajaSesion: {
      count: jest.fn(),
    },
    comprobantes: {
      findFirst: jest.fn(),
    },
    cuotaConvenio: {
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaPaymentRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<PrismaPaymentRepository>(PrismaPaymentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return mapped payment entity when found', async () => {
      prismaMock.pagos.findFirst.mockResolvedValue(rawPayment);

      const result = await repository.findById(1n);

      expect(result).not.toBeNull();
      expect(result?.pagoId).toBe(1n);
      expect(result?.montoTotalRecibido).toBe(150);
    });

    it('should return null when not found', async () => {
      prismaMock.pagos.findFirst.mockResolvedValue(null);

      const result = await repository.findById(999n);

      expect(result).toBeNull();
    });
  });

  describe('paginate', () => {
    it('should return paginated payment entities', async () => {
      prismaMock.pagos.findMany.mockResolvedValue([rawPayment]);
      prismaMock.pagos.count.mockResolvedValue(1);

      const result = await repository.paginate({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].pagoId).toBe(1n);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findSaldoFavorByCliente', () => {
    it('should return available saldos for a client', async () => {
      prismaMock.saldoFavorCliente.findMany.mockResolvedValue([rawSaldo]);

      const result = await repository.findSaldoFavorByCliente(10n);

      expect(result).toHaveLength(1);
      expect(result[0].saldoFavorId).toBe(1n);
      expect(result[0].montoSaldo).toBe(25);
    });
  });

  describe('clientExists', () => {
    it('should return true when count > 0', async () => {
      prismaMock.clientes.count.mockResolvedValue(1);

      const result = await repository.clientExists(10n);

      expect(result).toBe(true);
    });

    it('should return false when count === 0', async () => {
      prismaMock.clientes.count.mockResolvedValue(0);

      const result = await repository.clientExists(999n);

      expect(result).toBe(false);
    });
  });

  describe('isCajaOpen', () => {
    it('should return true when caja is open', async () => {
      prismaMock.cajaSesion.count.mockResolvedValue(1);

      const result = await repository.isCajaOpen(5n);

      expect(result).toBe(true);
    });
  });

  describe('findComprobanteById', () => {
    it('should return comprobante id and importeTotal', async () => {
      prismaMock.comprobantes.findFirst.mockResolvedValue({
        id: 100n,
        importeTotal: new Prisma.Decimal(50),
      });

      const result = await repository.findComprobanteById(100n);

      expect(result).toEqual({ id: 100n, importeTotal: 50 });
    });
  });

  describe('findComprobanteAppliedSum', () => {
    it('should calculate sum of applied detallePago', async () => {
      prismaMock.detallePago.findMany.mockResolvedValue([
        { montoAbonado: new Prisma.Decimal(20) },
        { montoAbonado: new Prisma.Decimal(30) },
      ]);

      const result = await repository.findComprobanteAppliedSum(100n);

      expect(result).toBe(50);
    });
  });

  describe('annulPagoTransaction', () => {
    it('should update many pagos and return affected count', async () => {
      prismaMock.pagos.updateMany.mockResolvedValue({ count: 1 });

      const result = await repository.annulPagoTransaction(
        1n,
        'PENDIENTE',
        {
          motivoAnulacion: 'error',
          anuladoPor: 'admin',
          fechaAnulacion: new Date(),
          deletedAt: new Date(),
        },
        prismaMock,
      );

      expect(result.count).toBe(1);
    });
  });
});
