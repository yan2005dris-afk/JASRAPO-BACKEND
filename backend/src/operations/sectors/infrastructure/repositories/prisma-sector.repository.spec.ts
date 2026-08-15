import { PrismaSectorRepository } from './prisma-sector.repository';
import type { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('PrismaSectorRepository', () => {
  let repository: PrismaSectorRepository;
  let prisma: {
    sectores: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    comunidades: {
      findUnique: jest.Mock;
    };
  };

  const rawSector = {
    sectorId: 1,
    nombre: 'Sector 1',
    codigo: 'SEC-001',
    comunidadId: 1,
    comunidades: {
      comunidadId: 1,
      codigo: 'COM-001',
      nombre: 'Comunidad 1',
    },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  beforeEach(() => {
    prisma = {
      sectores: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      comunidades: {
        findUnique: jest.fn(),
      },
    };
    repository = new PrismaSectorRepository(prisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('should find active sector by ID by default', async () => {
      prisma.sectores.findFirst.mockResolvedValue(rawSector);

      const result = await repository.findById(1);

      expect(result?.sectorId).toBe(1);
      expect(prisma.sectores.findFirst).toHaveBeenCalledWith({
        where: { sectorId: 1, deletedAt: null },
        include: { comunidades: true },
      });
    });

    it('should find sector including deleted when requested', async () => {
      prisma.sectores.findFirst.mockResolvedValue({
        ...rawSector,
        deletedAt: new Date(),
      });

      const result = await repository.findById(1, true);

      expect(result?.deletedAt).toBeInstanceOf(Date);
      expect(prisma.sectores.findFirst).toHaveBeenCalledWith({
        where: { sectorId: 1 },
        include: { comunidades: true },
      });
    });
  });

  describe('findByCodigo', () => {
    it('should find sector by unique code', async () => {
      prisma.sectores.findUnique.mockResolvedValue(rawSector);

      const result = await repository.findByCodigo('SEC-001');

      expect(result?.codigo).toBe('SEC-001');
      expect(prisma.sectores.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'SEC-001' },
        include: { comunidades: true },
      });
    });
  });

  describe('findComunidadById', () => {
    it('should return comunidad ref when exists', async () => {
      prisma.comunidades.findUnique.mockResolvedValue({
        comunidadId: 1,
        codigo: 'COM-001',
        nombre: 'Comunidad 1',
      });

      const result = await repository.findComunidadById(1);

      expect(result).toEqual({
        comunidadId: 1,
        codigo: 'COM-001',
        nombre: 'Comunidad 1',
      });
    });

    it('should return null when comunidad does not exist', async () => {
      prisma.comunidades.findUnique.mockResolvedValue(null);

      const result = await repository.findComunidadById(99);

      expect(result).toBeNull();
    });
  });

  describe('paginate', () => {
    it('should return mapped entities and count', async () => {
      prisma.sectores.findMany.mockResolvedValue([rawSector]);
      prisma.sectores.count.mockResolvedValue(1);

      const result = await repository.paginate(
        { comunidadId: 1 },
        { skip: 0, take: 10 },
      );

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].sectorId).toBe(1);
    });
  });

  describe('create', () => {
    it('should create and return domain entity', async () => {
      prisma.sectores.create.mockResolvedValue(rawSector);

      const result = await repository.create({
        nombre: 'Sector 1',
        codigo: 'SEC-001',
        comunidadId: 1,
      });

      expect(result.sectorId).toBe(1);
    });

    it('should throw EntityAlreadyExistsException on P2002 error', async () => {
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.0.0',
        },
      );
      prisma.sectores.create.mockRejectedValue(p2002Error);

      await expect(
        repository.create({
          nombre: 'Sector 1',
          codigo: 'SEC-001',
          comunidadId: 1,
        }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });
  });

  describe('update', () => {
    it('should update and return updated entity', async () => {
      prisma.sectores.update.mockResolvedValue({
        ...rawSector,
        nombre: 'Sector Modificado',
      });

      const result = await repository.update(1, {
        nombre: 'Sector Modificado',
      });

      expect(result.nombre).toBe('Sector Modificado');
    });

    it('should throw EntityNotFoundException on P2025 error', async () => {
      const p2025Error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '7.0.0',
        },
      );
      prisma.sectores.update.mockRejectedValue(p2025Error);

      await expect(repository.update(99, { nombre: 'Test' })).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt timestamp', async () => {
      prisma.sectores.update.mockResolvedValue({
        ...rawSector,
        deletedAt: new Date(),
      });

      const result = await repository.softDelete(1);

      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw EntityNotFoundException on P2025 error', async () => {
      const p2025Error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '7.0.0',
        },
      );
      prisma.sectores.update.mockRejectedValue(p2025Error);

      await expect(repository.softDelete(99)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
