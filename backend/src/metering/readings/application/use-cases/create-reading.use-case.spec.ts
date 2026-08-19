import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateReadingUseCase } from './create-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { Decimal } from 'decimal.js';

describe('CreateReadingUseCase', () => {
  let useCase: CreateReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createWithAtomicSnapshot: jest.fn(),
    update: jest.fn(),
    findActivePeriod: jest.fn(),
    findReadingSnapshot: jest.fn(),
    findLastApprovedActualByMeter: jest.fn(),
    findActiveInitialReadingByMeter: jest.fn(),
  };

  const mockStorageService = {
    upload: jest.fn(),
  };

  const mockReading = {
    lecturaId: BigInt(1),
    fecha: new Date('2026-01-15'),
    lecturaAnterior: 100,
    lecturaActual: 150,
    consumoCalculado: 50,
    medidorId: BigInt(1),
    periodoId: 1,
    estado: 'PENDIENTE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    useCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a reading with explicit periodoId using atomic snapshot', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaActual: 150,
      medidorId: '1',
      periodoId: 1,
    };

    mockReadingRepository.createWithAtomicSnapshot.mockResolvedValue(
      mockReading as any,
    );

    const result = await useCase.execute(dto);

    expect(result.lecturaActual).toBe(150);
    expect(mockReadingRepository.findActivePeriod).not.toHaveBeenCalled();
    expect(mockReadingRepository.createWithAtomicSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        medidorId: BigInt(1),
        periodoId: 1,
        lecturaActual: new Decimal(150),
        fecha: new Date('2026-01-15'),
      }),
    );
  });

  it('should auto-resolve the active period when periodoId is omitted', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaActual: 150,
      medidorId: '1',
    };

    mockReadingRepository.findActivePeriod.mockResolvedValue({
      periodoId: 5,
    });
    mockReadingRepository.createWithAtomicSnapshot.mockResolvedValue({
      ...mockReading,
      periodoId: 5,
    } as any);

    const result = await useCase.execute(dto);

    expect(mockReadingRepository.findActivePeriod).toHaveBeenCalled();
    expect(result.periodoId).toBe(5);
    expect(mockReadingRepository.createWithAtomicSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        periodoId: 5,
      }),
    );
  });

  it('should throw EntityNotFoundException when no active period exists', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaActual: 150,
      medidorId: '1',
    };

    mockReadingRepository.findActivePeriod.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException for non-numeric medidorId', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaActual: 150,
      medidorId: 'abc',
      periodoId: 1,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidDomainOperationException,
    );

    expect(mockReadingRepository.createWithAtomicSnapshot).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException for invalid fecha', async () => {
    const dto = {
      fecha: 'no-es-fecha',
      lecturaActual: 150,
      medidorId: '1',
      periodoId: 1,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidDomainOperationException,
    );

    expect(mockReadingRepository.createWithAtomicSnapshot).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException for invalid lecturaActual', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaActual: 'invalid-number' as any,
      medidorId: '1',
      periodoId: 1,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidDomainOperationException,
    );

    expect(mockReadingRepository.createWithAtomicSnapshot).not.toHaveBeenCalled();
  });
});
