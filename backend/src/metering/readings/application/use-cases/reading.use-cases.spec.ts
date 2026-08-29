import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { FindAllReadingsUseCase } from './find-all-readings.use-case';
import { FindOneReadingUseCase } from './find-one-reading.use-case';
import { UpdateReadingUseCase } from './update-reading.use-case';
import { RemoveReadingUseCase } from './remove-reading.use-case';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('Readings Use Cases', () => {
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
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    findActivePeriod: jest.fn().mockResolvedValue({ periodoId: 1 }),
    findReadingSnapshot: jest.fn(),
    findLastApprovedActualByMeter: jest.fn().mockResolvedValue(100),
    findActiveInitialReadingByMeter: jest.fn(),
    isReadingLinkedToReplacement: jest.fn().mockResolvedValue(false),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllReadingsUseCase,
        FindOneReadingUseCase,
        UpdateReadingUseCase,
        RemoveReadingUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
      ],
    }).compile();

    findAllUseCase = module.get<FindAllReadingsUseCase>(FindAllReadingsUseCase);
    findOneUseCase = module.get<FindOneReadingUseCase>(FindOneReadingUseCase);
    updateUseCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
    removeUseCase = module.get<RemoveReadingUseCase>(RemoveReadingUseCase);
    readingRepository = module.get<ReadingRepository>(ReadingRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('FindAllReadingsUseCase', () => {
    it('should return all readings with pagination', async () => {
      mockReadingRepository.findMany.mockResolvedValue([mockLectura]);
      mockReadingRepository.count.mockResolvedValue(1);
      const result = await findAllUseCase.execute();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('FindOneReadingUseCase', () => {
    it('should return a reading', async () => {
      mockReadingRepository.findUnique.mockResolvedValue(mockLectura);
      const result = await findOneUseCase.execute(BigInt(1));
      expect(result).toBeDefined();
      expect(result.lecturaActual).toBe(150);
    });

    it('should throw EntityNotFoundException if not found', async () => {
      mockReadingRepository.findUnique.mockResolvedValue(null);
      await expect(findOneUseCase.execute(BigInt(1))).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('UpdateReadingUseCase', () => {
    it('should update a reading', async () => {
      const updatedLectura = { ...mockLectura, lecturaActual: 200 };
      mockReadingRepository.findUnique.mockResolvedValue(mockLectura);
      mockReadingRepository.update.mockResolvedValue(updatedLectura);
      const result = await updateUseCase.execute(BigInt(1), {
        lecturaActual: 200,
      });
      expect(result.lecturaActual).toBe(200);
    });

    it('should throw EntityNotFoundException if not found', async () => {
      mockReadingRepository.findUnique.mockResolvedValue(null);
      await expect(updateUseCase.execute(BigInt(1), {})).rejects.toThrow(
        EntityNotFoundException,
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
