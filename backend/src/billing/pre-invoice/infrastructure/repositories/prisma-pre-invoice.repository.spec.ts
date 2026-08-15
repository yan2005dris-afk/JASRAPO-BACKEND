import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaPreInvoiceRepository } from './prisma-pre-invoice.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

describe('PrismaPreInvoiceRepository', () => {
  let repository: PrismaPreInvoiceRepository;

  const rawPreInvoice = {
    prefacturaId: BigInt(1),
    uuid: 'uuid-1',
    contratoId: BigInt(1),
    loteId: BigInt(1),
    periodoId: 1,
    puntoEmisionId: 1,
    subtotal: new Prisma.Decimal(100),
    iva: new Prisma.Decimal(12),
    descuentoTotal: new Prisma.Decimal(0),
    totalPagar: new Prisma.Decimal(112),
    deudaAnterior: new Prisma.Decimal(0),
    saldoVencido: new Prisma.Decimal(0),
    abono: new Prisma.Decimal(0),
    saldoActual: new Prisma.Decimal(112),
    meses_atrasado: 0,
    estado: 'GENERADA',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const prismaMock = {
    prefacturas: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaPreInvoiceRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<PrismaPreInvoiceRepository>(
      PrismaPreInvoiceRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('paginate', () => {
    it('should return paginated domain entities', async () => {
      prismaMock.prefacturas.findMany.mockResolvedValue([rawPreInvoice]);
      prismaMock.prefacturas.count.mockResolvedValue(1);

      const result = await repository.paginate({ estado: 'GENERADA' }, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].prefacturaId).toBe(BigInt(1));
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findIdsByLoteId', () => {
    it('should return list of IDs', async () => {
      prismaMock.prefacturas.findMany.mockResolvedValue([{ prefacturaId: BigInt(1) }]);

      const result = await repository.findIdsByLoteId(BigInt(1));

      expect(result).toEqual([{ prefacturaId: BigInt(1) }]);
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      prismaMock.prefacturas.findUnique.mockResolvedValue(rawPreInvoice);

      const result = await repository.findById(1);

      expect(result).not.toBeNull();
      expect(result?.prefacturaId).toBe(BigInt(1));
    });

    it('should return null when not found', async () => {
      prismaMock.prefacturas.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateState', () => {
    it('should update state with optimistic lock', async () => {
      prismaMock.prefacturas.updateMany.mockResolvedValue({ count: 1 });

      const result = await repository.updateState(1, 'APROBADA', 'EN_REVISION');

      expect(result).toBe(true);
      expect(prismaMock.prefacturas.updateMany).toHaveBeenCalledWith({
        where: { prefacturaId: BigInt(1), estado: 'EN_REVISION' },
        data: expect.objectContaining({ estado: 'APROBADA' }),
      });
    });

    it('should return false if no row was updated', async () => {
      prismaMock.prefacturas.updateMany.mockResolvedValue({ count: 0 });

      const result = await repository.updateState(1, 'APROBADA', 'EN_REVISION');

      expect(result).toBe(false);
    });
  });
});
