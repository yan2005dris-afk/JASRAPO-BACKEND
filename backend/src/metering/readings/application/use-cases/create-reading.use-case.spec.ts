import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateReadingUseCase } from './create-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';

describe('CreateReadingUseCase', () => {
  let useCase: CreateReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
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

  it('should create a reading for a meter', async () => {
    const dto = {
      fecha: '2026-01-15',
      lecturaAnterior: 100,
      lecturaActual: 150,
      consumoCalculado: 50,
      medidorId: '1',
      periodoId: 1,
      lecturaInicial: false,
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

    mockReadingRepository.create.mockResolvedValue(mockReading as any);
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);

    const result = await useCase.execute(dto);

    expect(result.lecturaActual).toBe(150);
    expect(mockReadingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        medidorId: BigInt(1),
      }),
    );
    expect(mockReadingRepository.findUnique).toHaveBeenCalledWith(
      { lecturaId: mockReading.lecturaId },
      expect.any(Object),
    );
  });
});
