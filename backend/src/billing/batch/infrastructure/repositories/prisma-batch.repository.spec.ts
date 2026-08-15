import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaBatchRepository } from './prisma-batch.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

describe('PrismaBatchRepository', () => {
  let repository: PrismaBatchRepository;

  const rawBatch = {
    loteId: BigInt(1),
    comunidadId: 1,
    periodoId: 1,
    estado: 'BORRADOR',
    totalMonto: new Prisma.Decimal(100),
    notas: null,
    creadoPor: 'admin',
    totalEmisiones: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prismaMock = {
    lote: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaBatchRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<PrismaBatchRepository>(PrismaBatchRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('paginate', () => {
    it('should return paginated domain entities', async () => {
      prismaMock.lote.findMany.mockResolvedValue([rawBatch]);
      prismaMock.lote.count.mockResolvedValue(1);

      const result = await repository.paginate({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].loteId).toBe(BigInt(1));
      expect(result.meta.total).toBe(1);
    });
  });

  describe('count', () => {
    it('should return total count', async () => {
      prismaMock.lote.count.mockResolvedValue(5);

      const result = await repository.count();

      expect(result).toBe(5);
    });
  });

  describe('findById', () => {
    it('should return domain entity when found', async () => {
      prismaMock.lote.findUnique.mockResolvedValue(rawBatch);

      const result = await repository.findById(1);

      expect(result).not.toBeNull();
      expect(result?.loteId).toBe(BigInt(1));
    });

    it('should return null when not found', async () => {
      prismaMock.lote.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('generate', () => {
    it('should call stored procedure and return loteId', async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([{ loteId: 42 }]);

      const result = await repository.generate({
        periodoId: 1,
        comunidadId: 2,
        creadoPor: 'admin',
      });

      expect(result).toBe(BigInt(42));
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        'SELECT generar_prefacturas_lote($1, $2, $3) as "loteId"',
        1,
        2,
        'admin',
      );
    });

    it('should return null when no loteId is returned', async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);

      const result = await repository.generate({
        periodoId: 1,
      });

      expect(result).toBeNull();
    });
  });
});
