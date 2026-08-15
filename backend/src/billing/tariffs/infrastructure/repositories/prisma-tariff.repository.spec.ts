import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaTariffRepository } from './prisma-tariff.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('PrismaTariffRepository', () => {
  let repository: PrismaTariffRepository;

  const rawTariff = {
    categoriaTarifaId: 1,
    nombre: 'Residencial',
    descripcion: 'Tarifa básica',
    valorBase: new Prisma.Decimal(5),
    consumoMinimoMensual: 10,
    valorExcedenteM3: new Prisma.Decimal(0.5),
    fechaVigenciaDesde: new Date('2026-01-01'),
    fechaVigenciaHasta: null,
    activo: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  const prismaMock = {
    categoriaTarifa: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTariffRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<PrismaTariffRepository>(PrismaTariffRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      prismaMock.categoriaTarifa.findFirst.mockResolvedValue(rawTariff);

      const result = await repository.findById(1);

      expect(result).not.toBeNull();
      expect(result?.categoriaTarifaId).toBe(1);
      expect(result?.nombre).toBe('Residencial');
      expect(result?.valorBase).toBe(5);
    });

    it('should return null when not found', async () => {
      prismaMock.categoriaTarifa.findFirst.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findActiveByNombre', () => {
    it('should return active entity by nombre', async () => {
      prismaMock.categoriaTarifa.findFirst.mockResolvedValue(rawTariff);

      const result = await repository.findActiveByNombre('Residencial');

      expect(result).not.toBeNull();
      expect(result?.nombre).toBe('Residencial');
    });
  });

  describe('paginate', () => {
    it('should return paginated result', async () => {
      prismaMock.categoriaTarifa.findMany.mockResolvedValue([rawTariff]);
      prismaMock.categoriaTarifa.count.mockResolvedValue(1);

      const result = await repository.paginate(
        { nombre: 'Residencial' },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('create', () => {
    it('should create and return entity', async () => {
      prismaMock.categoriaTarifa.create.mockResolvedValue(rawTariff);

      const result = await repository.create({
        nombre: 'Residencial',
        valorBase: 5,
        valorExcedenteM3: 0.5,
      });

      expect(result.categoriaTarifaId).toBe(1);
      expect(prismaMock.categoriaTarifa.create).toHaveBeenCalled();
    });

    it('should throw EntityAlreadyExistsException on P2002', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: '7.0.0',
      });
      prismaMock.categoriaTarifa.create.mockRejectedValue(p2002);

      await expect(
        repository.create({
          nombre: 'Residencial',
          valorBase: 5,
          valorExcedenteM3: 0.5,
        }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });
  });

  describe('createNewVersion', () => {
    it('should close current version and create new version in transaction', async () => {
      const newRaw = {
        ...rawTariff,
        categoriaTarifaId: 2,
        nombre: 'Residencial 2',
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const tx = {
          categoriaTarifa: {
            findFirst: jest
              .fn()
              .mockResolvedValueOnce(rawTariff) // find current
              .mockResolvedValueOnce(null), // find duplicate by name
            update: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue(newRaw),
          },
        };
        return callback(tx);
      });

      const result = await repository.createNewVersion(1, {
        nombre: 'Residencial 2',
      });

      expect(result.categoriaTarifaId).toBe(2);
      expect(result.nombre).toBe('Residencial 2');
    });

    it('should throw EntityNotFoundException if current does not exist', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const tx = {
          categoriaTarifa: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      await expect(
        repository.createNewVersion(999, { nombre: 'Test' }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw EntityAlreadyExistsException if new name matches another active tariff', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const tx = {
          categoriaTarifa: {
            findFirst: jest
              .fn()
              .mockResolvedValueOnce(rawTariff)
              .mockResolvedValueOnce({
                categoriaTarifaId: 3,
                nombre: 'Comercial',
              }),
          },
        };
        return callback(tx);
      });

      await expect(
        repository.createNewVersion(1, { nombre: 'Comercial' }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });
  });

  describe('softDelete', () => {
    it('should mark inactive and set deletedAt', async () => {
      prismaMock.categoriaTarifa.update.mockResolvedValue({
        ...rawTariff,
        activo: false,
        deletedAt: new Date(),
      });

      const result = await repository.softDelete(1);

      expect(result.activo).toBe(false);
    });

    it('should throw EntityNotFoundException on P2025', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prismaMock.categoriaTarifa.update.mockRejectedValue(p2025);

      await expect(repository.softDelete(999)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
