import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateReadingAnomalyUseCase } from './update-reading-anomaly.use-case';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import type { UpdateReadingAnomalyDto } from '../../interfaces/dto/update-reading-anomaly.dto';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateReadingAnomalyUseCase', () => {
  let useCase: UpdateReadingAnomalyUseCase;

  const mockReadingAnomalyRepository = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };

  const mockAnomaly = new ReadingAnomalyEntity({
    anomaliaId: BigInt(1),
    lecturaId: BigInt(42),
    observacion: 'Fuga de agua en el medidor',
    tipo: 'FUGA',
    estado: 'PENDIENTE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    fotoUrl: null,
  });

  const mockUpdatedAnomaly = new ReadingAnomalyEntity({
    anomaliaId: BigInt(1),
    lecturaId: BigInt(42),
    observacion: 'Fuga reparada',
    tipo: 'MEDIDOR_DAÑADO',
    estado: 'APROBADA',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    fotoUrl: null,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReadingAnomalyUseCase,
        {
          provide: ReadingAnomalyRepository,
          useValue: mockReadingAnomalyRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateReadingAnomalyUseCase>(
      UpdateReadingAnomalyUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update fields without lecturaId when lecturaId is absent', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(mockAnomaly);
    mockReadingAnomalyRepository.update.mockResolvedValue(mockUpdatedAnomaly);

    const updateDto: UpdateReadingAnomalyDto = {
      observacion: 'Fuga reparada',
      tipo: 'MEDIDOR_DAÑADO',
      estado: 'APROBADA',
    };

    const result = await useCase.execute(BigInt(1), updateDto);

    expect(result).toBe(mockUpdatedAnomaly);
    expect(mockReadingAnomalyRepository.update).toHaveBeenCalledWith(
      { anomaliaId: BigInt(1) },
      {
        observacion: 'Fuga reparada',
        tipo: 'MEDIDOR_DAÑADO',
        estado: 'APROBADA',
      },
    );
  });

  it('should convert a string lecturaId to bigint', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(mockAnomaly);
    mockReadingAnomalyRepository.update.mockResolvedValue(mockUpdatedAnomaly);

    await useCase.execute(BigInt(1), {
      lecturaId: '42',
      observacion: 'X',
    });

    expect(mockReadingAnomalyRepository.update).toHaveBeenCalledWith(
      { anomaliaId: BigInt(1) },
      expect.objectContaining({ lecturaId: BigInt(42) }),
    );
  });

  it('should throw EntityNotFoundException when anomaly not found', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(BigInt(999), { observacion: 'X' }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException when anomaly is soft-deleted', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue({
      ...mockAnomaly,
      deletedAt: new Date(),
    } as any);

    await expect(
      useCase.execute(BigInt(1), { observacion: 'X' }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException for non-numeric lecturaId', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(mockAnomaly);

    await expect(
      useCase.execute(BigInt(1), { lecturaId: 'abc' }),
    ).rejects.toThrow(InvalidDomainOperationException);

    expect(mockReadingAnomalyRepository.update).not.toHaveBeenCalled();
  });

  it('should not call update when anomaly is missing', async () => {
    mockReadingAnomalyRepository.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(BigInt(999), { observacion: 'X' }),
    ).rejects.toThrow(EntityNotFoundException);

    expect(mockReadingAnomalyRepository.update).not.toHaveBeenCalled();
  });
});
