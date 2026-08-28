import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateReadingUseCase } from './update-reading.use-case';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { EstadoLectura } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateReadingUseCase', () => {
  let useCase: UpdateReadingUseCase;

  const mockReadingRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateWithCas: jest.fn(),
    isReadingLinkedToReplacement: jest.fn().mockResolvedValue(false),
    findRouteStateByReadingId: jest.fn().mockResolvedValue(null),
  };

  const mockReading = {
    lecturaId: BigInt(1),
    lecturaActual: 150,
    estado: EstadoLectura.PENDIENTE,
    deletedAt: null,
  };

  const mockUpdatedReading = {
    lecturaId: BigInt(1),
    lecturaActual: 200,
    estado: EstadoLectura.POR_REVISION,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReadingUseCase,
        { provide: ReadingRepository, useValue: mockReadingRepository },
      ],
    }).compile();

    useCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a reading', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);
    mockReadingRepository.update.mockResolvedValue(mockUpdatedReading as any);

    const result = await useCase.execute(BigInt(1), { lecturaActual: 200 });

    expect(result.lecturaActual).toBe(200);
    expect(mockReadingRepository.update).toHaveBeenCalledWith(
      { lecturaId: BigInt(1) },
      expect.objectContaining({ lecturaActual: 200 }),
    );
  });

  it('should throw EntityNotFoundException when reading not found', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(BigInt(999), { lecturaActual: 200 }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException when reading is deleted', async () => {
    mockReadingRepository.findUnique.mockResolvedValue({
      ...mockReading,
      deletedAt: new Date(),
    } as any);

    await expect(
      useCase.execute(BigInt(1), { lecturaActual: 200 }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should transition estado via CAS when targetEstado is provided', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);
    mockReadingRepository.updateWithCas.mockResolvedValue(
      mockUpdatedReading as any,
    );

    const result = await useCase.execute(
      BigInt(1),
      { lecturaActual: 200 },
      EstadoLectura.POR_REVISION,
    );

    expect(result.lecturaActual).toBe(200);
    expect(mockReadingRepository.updateWithCas).toHaveBeenCalledWith(
      { lecturaId: BigInt(1), estado: EstadoLectura.PENDIENTE },
      expect.objectContaining({
        lecturaActual: 200,
        estado: EstadoLectura.POR_REVISION,
      }),
    );
  });

  it('should throw InvalidDomainOperationException on invalid state transition', async () => {
    mockReadingRepository.findUnique.mockResolvedValue({
      ...mockReading,
      estado: EstadoLectura.APROBADA,
    } as any);

    await expect(
      useCase.execute(
        BigInt(1),
        { lecturaActual: 200 },
        EstadoLectura.POR_REVISION,
      ),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw InvalidDomainOperationException on CAS conflict', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);
    mockReadingRepository.updateWithCas.mockResolvedValue(null);

    await expect(
      useCase.execute(
        BigInt(1),
        { lecturaActual: 200 },
        EstadoLectura.POR_REVISION,
      ),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw InvalidDomainOperationException when reading is linked to a replacement', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);
    mockReadingRepository.isReadingLinkedToReplacement.mockResolvedValue(true);

    await expect(
      useCase.execute(BigInt(1), { lecturaActual: 200 }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw when the reading route is not EN_PROGRESO', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);
    mockReadingRepository.isReadingLinkedToReplacement.mockResolvedValue(false);
    mockReadingRepository.findRouteStateByReadingId.mockResolvedValue(
      'PENDIENTE',
    );

    await expect(
      useCase.execute(BigInt(1), { lecturaActual: 200 }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should allow the update when the reading route is EN_PROGRESO', async () => {
    mockReadingRepository.findUnique.mockResolvedValue(mockReading as any);
    mockReadingRepository.isReadingLinkedToReplacement.mockResolvedValue(false);
    mockReadingRepository.findRouteStateByReadingId.mockResolvedValue(
      'EN_PROGRESO',
    );
    mockReadingRepository.update.mockResolvedValue(mockUpdatedReading as any);

    const result = await useCase.execute(BigInt(1), { lecturaActual: 200 });

    expect(result).toBe(mockUpdatedReading);
  });
});
