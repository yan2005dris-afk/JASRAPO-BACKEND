import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateReadingAnomalyUseCase } from './create-reading-anomaly.use-case';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import type { CreateReadingAnomalyDto } from '../../interfaces/dto/create-reading-anomaly.dto';
import { EstadoLectura } from 'src/shared/enums';

describe('CreateReadingAnomalyUseCase', () => {
  let useCase: CreateReadingAnomalyUseCase;

  const mockReadingAnomalyRepository = {
    createAndMarkReadingWithAnomaly: jest.fn(),
  };

  const mockDto: CreateReadingAnomalyDto = {
    lecturaId: '42',
    observacion: 'Fuga de agua en el medidor',
    tipo: 'FUGA',
    estado: 'PENDIENTE',
  };

  const mockCreatedAnomaly = new ReadingAnomalyEntity({
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingAnomalyUseCase,
        {
          provide: ReadingAnomalyRepository,
          useValue: mockReadingAnomalyRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateReadingAnomalyUseCase>(
      CreateReadingAnomalyUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create the anomaly and update the reading estado to CON_NOVEDAD atomically', async () => {
    mockReadingAnomalyRepository.createAndMarkReadingWithAnomaly.mockResolvedValue(
      mockCreatedAnomaly,
    );

    const result = await useCase.execute(mockDto);

    expect(
      mockReadingAnomalyRepository.createAndMarkReadingWithAnomaly,
    ).toHaveBeenCalledWith({
      lecturaId: BigInt(42),
      observacion: 'Fuga de agua en el medidor',
      tipo: 'FUGA',
      estado: 'PENDIENTE',
      nextEstadoLectura: EstadoLectura.CON_NOVEDAD,
    });

    expect(result).toBe(mockCreatedAnomaly);
  });

  it('should return the created anomaly entity from the transactional method', async () => {
    const differentAnomaly = new ReadingAnomalyEntity({
      anomaliaId: BigInt(99),
      lecturaId: BigInt(7),
      observacion: null,
      tipo: 'MEDIDOR_DAÑADO',
      estado: 'PENDIENTE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      fotoUrl: null,
    });

    const differentDto: CreateReadingAnomalyDto = {
      lecturaId: '7',
      tipo: 'MEDIDOR_DAÑADO',
      estado: 'PENDIENTE',
    };

    mockReadingAnomalyRepository.createAndMarkReadingWithAnomaly.mockResolvedValue(
      differentAnomaly,
    );

    const result = await useCase.execute(differentDto);

    expect(
      mockReadingAnomalyRepository.createAndMarkReadingWithAnomaly,
    ).toHaveBeenCalledWith({
      lecturaId: BigInt(7),
      tipo: 'MEDIDOR_DAÑADO',
      estado: 'PENDIENTE',
      nextEstadoLectura: EstadoLectura.CON_NOVEDAD,
    });
    expect(result.anomaliaId).toBe(BigInt(99));
    expect(result.lecturaId).toBe(BigInt(7));
  });
});
