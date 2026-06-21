import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateReadingAnomalyUseCase } from './create-reading-anomaly.use-case';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingRepository } from 'src/metering/readings/domain/repositories/reading.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import type { CreateReadingAnomalyDto } from '../../interfaces/dto/create-reading-anomaly.dto';

describe('CreateReadingAnomalyUseCase', () => {
  let useCase: CreateReadingAnomalyUseCase;

  const mockReadingAnomalyRepository = {
    create: jest.fn(),
  };

  const mockReadingRepository = {
    update: jest.fn(),
  };

  const mockDto: CreateReadingAnomalyDto = {
    lecturaId: '42',
    observacion: 'Fuga de agua en el medidor',
    tipo: 'FUGA' as any,
    estado: 'PENDIENTE' as any,
  };

  const mockCreatedAnomaly = new ReadingAnomalyEntity({
    anomaliaId: BigInt(1),
    lecturaId: BigInt(42),
    observacion: 'Fuga de agua en el medidor',
    tipo: 'FUGA' as any,
    estado: 'PENDIENTE' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    fotoUrl: null,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingAnomalyUseCase,
        {
          provide: ReadingAnomalyRepository,
          useValue: mockReadingAnomalyRepository,
        },
        {
          provide: ReadingRepository,
          useValue: mockReadingRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateReadingAnomalyUseCase>(CreateReadingAnomalyUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create the anomaly and update the reading estado to CON_NOVEDAD', async () => {
    mockReadingAnomalyRepository.create.mockResolvedValue(mockCreatedAnomaly);
    mockReadingRepository.update.mockResolvedValue({} as any);

    const result = await useCase.execute(mockDto);

    expect(mockReadingAnomalyRepository.create).toHaveBeenCalledWith({
      lecturaId: BigInt(42),
      observacion: 'Fuga de agua en el medidor',
      tipo: 'FUGA',
      estado: 'PENDIENTE',
    });

    expect(mockReadingRepository.update).toHaveBeenCalledWith(
      { lecturaId: BigInt(42) },
      { estado: 'CON_NOVEDAD' },
    );

    expect(result).toBe(mockCreatedAnomaly);
  });

  it('should return the created anomaly entity even when reading update is called', async () => {
    const differentAnomaly = new ReadingAnomalyEntity({
      anomaliaId: BigInt(99),
      lecturaId: BigInt(7),
      observacion: null,
      tipo: 'MEDIDOR_DAÑADO' as any,
      estado: 'PENDIENTE' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      fotoUrl: null,
    });

    const differentDto: CreateReadingAnomalyDto = {
      lecturaId: '7',
      tipo: 'MEDIDOR_DAÑADO' as any,
      estado: 'PENDIENTE' as any,
    };

    mockReadingAnomalyRepository.create.mockResolvedValue(differentAnomaly);
    mockReadingRepository.update.mockResolvedValue({} as any);

    const result = await useCase.execute(differentDto);

    expect(mockReadingRepository.update).toHaveBeenCalledWith(
      { lecturaId: BigInt(7) },
      { estado: 'CON_NOVEDAD' },
    );
    expect(result.anomaliaId).toBe(BigInt(99));
    expect(result.lecturaId).toBe(BigInt(7));
  });
});
