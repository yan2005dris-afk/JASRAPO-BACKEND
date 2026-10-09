import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaDiscountRepository } from './prisma-discount.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('PrismaDiscountRepository', () => {
  let repository: PrismaDiscountRepository;

  const rawDiscount = {
    id: 1,
    nombre: 'Tercera Edad',
    descripcion: 'Descuento 50%',
    tipoDescuento: 'TERCERA_EDAD' as const,
    valor: new Prisma.Decimal(50),
    esPorcentaje: true,
    rubroId: null,
    activo: true,
    aplicaAutomatico: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prismaMock = {
    catalogoDescuento: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaDiscountRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<PrismaDiscountRepository>(PrismaDiscountRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createCatalogo', () => {
    it('should create and map domain entity', async () => {
      prismaMock.catalogoDescuento.create.mockResolvedValue(rawDiscount);

      const result = await repository.createCatalogo({
        nombre: 'Tercera Edad',
        tipoDescuento: 'TERCERA_EDAD',
        valor: 50,
        esPorcentaje: true,
      });

      expect(result.id).toBe(1);
      expect(Number(result.valor)).toBe(50);
    });

    it('should throw EntityAlreadyExistsException on P2002', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: '7.0.0',
      });
      prismaMock.catalogoDescuento.create.mockRejectedValue(p2002);

      await expect(
        repository.createCatalogo({
          nombre: 'Tercera Edad',
          tipoDescuento: 'TERCERA_EDAD',
          valor: 50,
          esPorcentaje: true,
        }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });
  });

  describe('findManyCatalogo', () => {
    it('should return mapped domain entities', async () => {
      prismaMock.catalogoDescuento.findMany.mockResolvedValue([rawDiscount]);

      const result = await repository.findManyCatalogo({
        where: { activo: true },
      });

      expect(result).toHaveLength(1);
      expect(result[0].nombre).toBe('Tercera Edad');
    });
  });

  describe('countCatalogo', () => {
    it('should return total count', async () => {
      prismaMock.catalogoDescuento.count.mockResolvedValue(5);

      const result = await repository.countCatalogo({
        where: { activo: true },
      });

      expect(result).toBe(5);
    });
  });

  describe('findUniqueCatalogo', () => {
    it('should return entity if found', async () => {
      prismaMock.catalogoDescuento.findUnique.mockResolvedValue(rawDiscount);

      const result = await repository.findUniqueCatalogo(1);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
    });

    it('should return null if not found', async () => {
      prismaMock.catalogoDescuento.findUnique.mockResolvedValue(null);

      const result = await repository.findUniqueCatalogo(999);

      expect(result).toBeNull();
    });
  });

  describe('updateCatalogo', () => {
    it('should update and return entity', async () => {
      prismaMock.catalogoDescuento.update.mockResolvedValue(rawDiscount);

      const result = await repository.updateCatalogo(1, { nombre: 'Updated' });

      expect(result.id).toBe(1);
    });

    it('should throw EntityNotFoundException on P2025', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prismaMock.catalogoDescuento.update.mockRejectedValue(p2025);

      await expect(
        repository.updateCatalogo(999, { nombre: 'Test' }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
