import { PrismaCommunityRepository } from './prisma-community.repository';
import type { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('PrismaCommunityRepository', () => {
  let repository: PrismaCommunityRepository;
  let prisma: {
    comunidades: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const rawComunidad = {
    comunidadId: 1,
    nombre: 'Comunidad 1',
    codigo: 'C1',
    porcentajeTasaSeguridad: 5,
    sector: [{ sectorId: 10, nombre: 'Sector A', codigo: 'SA' }],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  beforeEach(() => {
    prisma = {
      comunidades: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new PrismaCommunityRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('findById', () => {
    it('should find active community by ID by default', async () => {
      prisma.comunidades.findFirst.mockResolvedValue(rawComunidad);

      const result = await repository.findById(1);

      expect(result?.comunidadId).toBe(1);
      expect(prisma.comunidades.findFirst).toHaveBeenCalledWith({
        where: { comunidadId: 1, deletedAt: null },
        include: expect.any(Object),
      });
    });

    it('should find community including deleted when requested', async () => {
      prisma.comunidades.findFirst.mockResolvedValue({
        ...rawComunidad,
        deletedAt: new Date(),
      });

      const result = await repository.findById(1, true);

      expect(result?.deletedAt).toBeInstanceOf(Date);
      expect(prisma.comunidades.findFirst).toHaveBeenCalledWith({
        where: { comunidadId: 1 },
        include: expect.any(Object),
      });
    });
  });

  describe('findByCodigo', () => {
    it('should find community by unique code', async () => {
      prisma.comunidades.findUnique.mockResolvedValue(rawComunidad);

      const result = await repository.findByCodigo('C1');

      expect(result?.codigo).toBe('C1');
      expect(prisma.comunidades.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'C1' },
        include: expect.any(Object),
      });
    });
  });

  describe('findActiveByNameOrCode', () => {
    it('should query active records with OR filter', async () => {
      prisma.comunidades.findFirst.mockResolvedValue(rawComunidad);

      const result = await repository.findActiveByNameOrCode(
        'Comunidad 1',
        'C1',
      );

      expect(result?.comunidadId).toBe(1);
      expect(prisma.comunidades.findFirst).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { nombre: { equals: 'Comunidad 1', mode: 'insensitive' } },
            { codigo: 'C1' },
          ],
        },
        include: expect.any(Object),
      });
    });
  });

  describe('paginate', () => {
    it('should return mapped entities and count', async () => {
      prisma.comunidades.findMany.mockResolvedValue([rawComunidad]);
      prisma.comunidades.count.mockResolvedValue(1);

      const result = await repository.paginate(
        { nombre: 'Comunidad', codigo: 'C1' },
        { skip: 0, take: 10 },
      );

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].comunidadId).toBe(1);
      expect(prisma.comunidades.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          nombre: { contains: 'Comunidad', mode: 'insensitive' },
          codigo: { contains: 'C1', mode: 'insensitive' },
        },
        skip: 0,
        take: 10,
        orderBy: { nombre: 'asc' },
        include: expect.any(Object),
      });
    });
  });

  describe('create', () => {
    it('should create and return domain entity', async () => {
      prisma.comunidades.create.mockResolvedValue(rawComunidad);

      const result = await repository.create({
        nombre: 'Comunidad 1',
        codigo: 'C1',
        porcentajeTasaSeguridad: 5,
      });

      expect(result.comunidadId).toBe(1);
    });

    it('should throw EntityAlreadyExistsException on P2002 error', async () => {
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.0.0',
        },
      );
      prisma.comunidades.create.mockRejectedValue(p2002Error);

      await expect(
        repository.create({
          nombre: 'Comunidad 1',
          codigo: 'C1',
          porcentajeTasaSeguridad: 5,
        }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });
  });

  describe('update', () => {
    it('should update and return updated entity', async () => {
      prisma.comunidades.update.mockResolvedValue({
        ...rawComunidad,
        nombre: 'Comunidad Modificada',
      });

      const result = await repository.update(1, {
        nombre: 'Comunidad Modificada',
      });

      expect(result.nombre).toBe('Comunidad Modificada');
    });

    it('should throw EntityNotFoundException on P2025 error', async () => {
      const p2025Error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '7.0.0',
        },
      );
      prisma.comunidades.update.mockRejectedValue(p2025Error);

      await expect(repository.update(99, { nombre: 'Test' })).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('reactivate', () => {
    it('should set deletedAt to null and update fields', async () => {
      prisma.comunidades.update.mockResolvedValue(rawComunidad);

      const result = await repository.reactivate(1, {
        nombre: 'Comunidad Reactivada',
        porcentajeTasaSeguridad: 8,
      });

      expect(result.deletedAt).toBeNull();
      expect(prisma.comunidades.update).toHaveBeenCalledWith({
        where: { comunidadId: 1 },
        data: {
          nombre: 'Comunidad Reactivada',
          porcentajeTasaSeguridad: new Prisma.Decimal(8),
          deletedAt: null,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt timestamp', async () => {
      prisma.comunidades.update.mockResolvedValue({
        ...rawComunidad,
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
      prisma.comunidades.update.mockRejectedValue(p2025Error);

      await expect(repository.softDelete(99)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
