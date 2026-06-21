import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateReadingUseCase } from './create-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { StorageService } from 'src/infrastructure/storage/storage.service';

describe('CreateReadingUseCase', () => {
  let useCase: CreateReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockPrisma = {
    periodos: {
      findFirst: jest.fn(),
    },
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
        { provide: PrismaService, useValue: mockPrisma },
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

    mockReadingRepository.create.mockResolvedValue(mockReading as any);
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);

    const result = await useCase.execute(dto);

    expect(result.lecturaActual).toBe(150);
    expect(mockPrisma.periodos.findFirst).not.toHaveBeenCalled();
    expect(mockReadingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ medidorId: BigInt(1), periodoId: 1 }),
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

    mockPrisma.periodos.findFirst.mockResolvedValue({ periodoId: 5 });
    mockReadingRepository.create.mockResolvedValue({
      ...mockReading,
      periodoId: 5,
    } as any);
    mockReadingRepository.findUnique.mockResolvedValue({
      ...mockReading,
      periodoId: 5,
    } as any);

    const result = await useCase.execute(dto);

    expect(mockPrisma.periodos.findFirst).toHaveBeenCalledWith({
      where: { estado: 'ABIERTO' },
      select: { periodoId: true },
    });
    expect(result.periodoId).toBe(5);
  });

  it('should throw NotFoundException when no active period exists', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 100,
      lecturaActual: 150,
      medidorId: '1',
      lecturaInicial: false,
    };

    mockPrisma.periodos.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should upload fotoBase64 to storage and store the key as fotoUrl', async () => {
    const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 100,
      lecturaActual: 150,
      medidorId: '1',
      periodoId: 1,
      lecturaInicial: false,
      fotoBase64: base64,
    };

    mockStorageService.upload.mockResolvedValue({ key: 'readings/uuid.jpg' });
    mockReadingRepository.create.mockResolvedValue(mockReading as any);
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);

    await useCase.execute(dto);

    expect(mockStorageService.upload).toHaveBeenCalledWith(
      'readings',
      expect.stringMatching(/^readings\/.+\.jpg$/),
      expect.any(Buffer),
      { contentType: 'image/jpeg' },
    );
    expect(mockReadingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fotoUrl: expect.stringMatching(/^readings\/.+\.jpg$/),
      }),
    );
  });

  it('should prefer fotoUrl over fotoBase64 when both are provided', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 100,
      lecturaActual: 150,
      medidorId: '1',
      periodoId: 1,
      lecturaInicial: false,
      fotoUrl: 'readings/existing-key.jpg',
      fotoBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    };

    mockReadingRepository.create.mockResolvedValue(mockReading as any);
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);

    await useCase.execute(dto);

    expect(mockStorageService.upload).not.toHaveBeenCalled();
    expect(mockReadingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ fotoUrl: 'readings/existing-key.jpg' }),
    );
  });
});
