import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateReadingUseCase } from './create-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('CreateReadingUseCase', () => {
  let useCase: CreateReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findActivePeriod: jest.fn(),
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

  it('should create a reading with explicit periodoId', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 100,
      lecturaActual: 150,
      consumoCalculado: 50,
      medidorId: '1',
      periodoId: 1,
      lecturaInicial: false,
    };

    mockReadingRepository.findLastApprovedActualByMeter.mockResolvedValue(100);
    mockReadingRepository.create.mockResolvedValue(mockReading as any);
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);

    const result = await useCase.execute(dto);

    expect(result.lecturaActual).toBe(150);
    expect(mockReadingRepository.findActivePeriod).not.toHaveBeenCalled();
    expect(mockReadingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        medidorId: BigInt(1),
        periodoId: 1,
        lecturaAnterior: 100,
        lecturaInicial: false,
        consumoCalculado: 50,
      }),
    );
  });

  it('should auto-resolve the active period when periodoId is omitted', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 100,
      lecturaActual: 150,
      medidorId: '1',
      lecturaInicial: false,
    };

    mockReadingRepository.findActivePeriod.mockResolvedValue({
      periodoId: 5,
    });
    mockReadingRepository.findLastApprovedActualByMeter.mockResolvedValue(100);
    mockReadingRepository.create.mockResolvedValue({
      ...mockReading,
      periodoId: 5,
    } as any);
    mockReadingRepository.findUnique.mockResolvedValue({
      ...mockReading,
      periodoId: 5,
    } as any);

    const result = await useCase.execute(dto);

    expect(mockReadingRepository.findActivePeriod).toHaveBeenCalled();
    expect(result.periodoId).toBe(5);
  });

  it('should throw EntityNotFoundException when no active period exists', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 100,
      lecturaActual: 150,
      medidorId: '1',
      lecturaInicial: false,
    };

    mockReadingRepository.findActivePeriod.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException for non-numeric medidorId', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 100,
      lecturaActual: 150,
      medidorId: 'abc',
      periodoId: 1,
      lecturaInicial: false,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidDomainOperationException,
    );

    expect(mockReadingRepository.create).not.toHaveBeenCalled();
  });

  it('should throw InvalidDomainOperationException for invalid fecha', async () => {
    const dto = {
      fecha: 'no-es-fecha',
      lecturaAnterior: 100,
      lecturaActual: 150,
      medidorId: '1',
      periodoId: 1,
      lecturaInicial: false,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      InvalidDomainOperationException,
    );

    expect(mockReadingRepository.create).not.toHaveBeenCalled();
  });

  it('should snapshot historial inicial when there is no approved reading', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 0,
      lecturaActual: 25,
      medidorId: '1',
      periodoId: 1,
      lecturaInicial: false,
    };

    mockReadingRepository.findLastApprovedActualByMeter.mockResolvedValue(null);
    mockReadingRepository.findActiveInitialReadingByMeter.mockResolvedValue(10);
    mockReadingRepository.create.mockResolvedValue(mockReading as any);
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);

    await useCase.execute(dto);

    expect(
      mockReadingRepository.findActiveInitialReadingByMeter,
    ).toHaveBeenCalledWith(BigInt(1));
    expect(mockReadingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        lecturaAnterior: 10,
        lecturaInicial: true,
        consumoCalculado: 15,
      }),
    );
  });

  it('should throw EntityNotFoundException when meter has no active history', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 0,
      lecturaActual: 25,
      medidorId: '1',
      periodoId: 1,
      lecturaInicial: false,
    };

    mockReadingRepository.findLastApprovedActualByMeter.mockResolvedValue(null);
    mockReadingRepository.findActiveInitialReadingByMeter.mockResolvedValue(
      null,
    );

    await expect(useCase.execute(dto)).rejects.toThrow(EntityNotFoundException);
    expect(mockReadingRepository.create).not.toHaveBeenCalled();
  });
});
