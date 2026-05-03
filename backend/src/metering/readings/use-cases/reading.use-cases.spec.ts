import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateReadingUseCase } from './create-reading.use-case';
import { FindAllReadingsUseCase } from './find-all-readings.use-case';
import { FindOneReadingUseCase } from './find-one-reading.use-case';
import { UpdateReadingUseCase } from './update-reading.use-case';
import { RemoveReadingUseCase } from './remove-reading.use-case';
import { NotFoundException } from '@nestjs/common';
import { LecturaEntity } from '../entities/lectura.entity';

describe('Readings Use Cases', () => {
  let createUseCase: CreateReadingUseCase;
  let findAllUseCase: FindAllReadingsUseCase;
  let findOneUseCase: FindOneReadingUseCase;
  let updateUseCase: UpdateReadingUseCase;
  let removeUseCase: RemoveReadingUseCase;
  let prisma: PrismaService;

  const mockLectura = {
    lecturaId: BigInt(1),
    fecha: new Date(),
    lecturaAnterior: 100,
    lecturaActual: 150,
    consumoCalculado: 50,
    contratoId: BigInt(1),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    lecturas: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingUseCase,
        FindAllReadingsUseCase,
        FindOneReadingUseCase,
        UpdateReadingUseCase,
        RemoveReadingUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    createUseCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
    findAllUseCase = module.get<FindAllReadingsUseCase>(FindAllReadingsUseCase);
    findOneUseCase = module.get<FindOneReadingUseCase>(FindOneReadingUseCase);
    updateUseCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
    removeUseCase = module.get<RemoveReadingUseCase>(RemoveReadingUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('CreateReadingUseCase', () => {
    it('should create a reading', async () => {
      mockPrismaService.lecturas.create.mockResolvedValue(mockLectura);
      const result = await createUseCase.execute({
        fecha: '2024-01-01',
        lecturaAnterior: 100,
        lecturaActual: 150,
        contratoId: '1',
      } as any);
      expect(result).toBeInstanceOf(LecturaEntity);
      expect(mockPrismaService.lecturas.create).toHaveBeenCalled();
    });
  });

  describe('FindAllReadingsUseCase', () => {
    it('should return all readings', async () => {
      mockPrismaService.lecturas.findMany.mockResolvedValue([mockLectura]);
      const result = await findAllUseCase.execute({});
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LecturaEntity);
    });
  });

  describe('FindOneReadingUseCase', () => {
    it('should return a reading', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(mockLectura);
      const result = await findOneUseCase.execute(BigInt(1));
      expect(result).toBeInstanceOf(LecturaEntity);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(null);
      await expect(findOneUseCase.execute(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UpdateReadingUseCase', () => {
    it('should update a reading', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(mockLectura);
      mockPrismaService.lecturas.update.mockResolvedValue({
        ...mockLectura,
        lecturaActual: 200,
      });
      const result = await updateUseCase.execute(BigInt(1), {
        lecturaActual: 200,
      });
      expect(result.lecturaActual).toBe(200);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(null);
      await expect(updateUseCase.execute(BigInt(1), {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('RemoveReadingUseCase', () => {
    it('should remove a reading', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(mockLectura);
      const result = await removeUseCase.execute(BigInt(1));
      expect(result.message).toContain('eliminada');
      expect(mockPrismaService.lecturas.update).toHaveBeenCalledWith({
        where: { lecturaId: BigInt(1) },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
