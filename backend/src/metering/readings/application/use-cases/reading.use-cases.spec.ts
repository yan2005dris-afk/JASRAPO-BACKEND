import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { CreateReadingUseCase } from './create-reading.use-case';
import { FindAllReadingsUseCase } from './find-all-readings.use-case';
import { FindOneReadingUseCase } from './find-one-reading.use-case';
import { UpdateReadingUseCase } from './update-reading.use-case';
import { RemoveReadingUseCase } from './remove-reading.use-case';
import { NotFoundException } from '@nestjs/common';
import { LecturaEntity } from '../../domain/entities/lectura.entity';

describe('Readings Use Cases', () => {
  let createUseCase: CreateReadingUseCase;
  let findAllUseCase: FindAllReadingsUseCase;
  let findOneUseCase: FindOneReadingUseCase;
  let updateUseCase: UpdateReadingUseCase;
  let removeUseCase: RemoveReadingUseCase;
  let readingRepository: ReadingRepository;

  const mockLectura = {
    lecturaId: BigInt(1),
    fecha: new Date(),
    lecturaAnterior: 100,
    lecturaActual: 150,
    consumoCalculado: 50,
    medidorId: BigInt(1),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockReadingRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingUseCase,
        FindAllReadingsUseCase,
        FindOneReadingUseCase,
        UpdateReadingUseCase,
        RemoveReadingUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
      ],
    }).compile();

    createUseCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
    findAllUseCase = module.get<FindAllReadingsUseCase>(FindAllReadingsUseCase);
    findOneUseCase = module.get<FindOneReadingUseCase>(FindOneReadingUseCase);
    updateUseCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
    removeUseCase = module.get<RemoveReadingUseCase>(RemoveReadingUseCase);
    readingRepository = module.get<ReadingRepository>(ReadingRepository);
  });

  describe('CreateReadingUseCase', () => {
    it('should create a reading', async () => {
      mockReadingRepository.create.mockResolvedValue(mockLectura);
      const result = await createUseCase.execute({
        fecha: '2024-01-01',
        lecturaAnterior: 100,
        lecturaActual: 150,
        medidorId: '1',
      } as any);
      expect(result).toBeInstanceOf(LecturaEntity);
      expect(mockReadingRepository.create).toHaveBeenCalled();
    });
  });

  describe('FindAllReadingsUseCase', () => {
    it('should return all readings', async () => {
      mockReadingRepository.findMany.mockResolvedValue([mockLectura]);
      const result = await findAllUseCase.execute({});
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LecturaEntity);
    });
  });

  describe('FindOneReadingUseCase', () => {
    it('should return a reading', async () => {
      mockReadingRepository.findUnique.mockResolvedValue(mockLectura);
      const result = await findOneUseCase.execute(BigInt(1));
      expect(result).toBeInstanceOf(LecturaEntity);
    });

    it('should throw NotFoundException if not found', async () => {
      mockReadingRepository.findUnique.mockResolvedValue(null);
      await expect(findOneUseCase.execute(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UpdateReadingUseCase', () => {
    it('should update a reading', async () => {
      mockReadingRepository.findUnique.mockResolvedValue(mockLectura);
      mockReadingRepository.update.mockResolvedValue({
        ...mockLectura,
        lecturaActual: 200,
      });
      const result = await updateUseCase.execute(BigInt(1), {
        lecturaActual: 200,
      });
      expect(result.lecturaActual).toBe(200);
    });

    it('should throw NotFoundException if not found', async () => {
      mockReadingRepository.findUnique.mockResolvedValue(null);
      await expect(updateUseCase.execute(BigInt(1), {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('RemoveReadingUseCase', () => {
    it('should remove a reading', async () => {
      mockReadingRepository.findUnique.mockResolvedValue(mockLectura);
      const result = await removeUseCase.execute(BigInt(1));
      expect(result.message).toContain('eliminada');
      expect(mockReadingRepository.update).toHaveBeenCalledWith(
        { lecturaId: BigInt(1) },
        { deletedAt: expect.any(Date) },
      );
    });
  });
});
