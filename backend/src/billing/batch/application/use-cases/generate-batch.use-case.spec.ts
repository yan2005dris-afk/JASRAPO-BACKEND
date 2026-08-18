import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GenerateBatchUseCase } from './generate-batch.use-case';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { RouteRepository } from 'src/operations/routes/domain/repositories/route.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

const completedReadingRoute = {
  rutaId: 2n,
  nombre: 'Agosto',
  descripcion: null,
  operarioId: 1,
  tipoRuta: 'TOMA_LECTURA',
  comunidadId: 1,
  sectorId: null,
  periodoId: 3,
  estado: 'COMPLETADA',
  fechaPlanificada: '2026-08-17T00:00:00.000Z',
  fechaInicio: null,
  fechaFin: null,
};

describe('GenerateBatchUseCase', () => {
  let useCase: GenerateBatchUseCase;

  const mockRepository = {
    paginate: jest.fn(),
    findById: jest.fn(),
    count: jest.fn(),
    generate: jest.fn(),
  };

  const mockRouteRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        GenerateBatchUseCase,
        { provide: BatchRepository, useValue: mockRepository },
        { provide: RouteRepository, useValue: mockRouteRepository },
      ],
    }).compile();

    useCase = module.get<GenerateBatchUseCase>(GenerateBatchUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should generate batch from a completed TOMA_LECTURA route', async () => {
    mockRouteRepository.findById.mockResolvedValue(completedReadingRoute);
    mockRepository.count.mockResolvedValue(0);
    mockRepository.generate.mockResolvedValue(BigInt(42));

    const result = await useCase.execute({
      periodoId: 3,
      comunidadId: 1,
      rutaId: 2,
      mes: 8,
      creadoPor: 'admin',
    });

    expect(result.batchId).toBe(42);
    expect(mockRouteRepository.findById).toHaveBeenCalledWith(2n);
    expect(mockRepository.generate).toHaveBeenCalledWith({
      periodoId: 3,
      comunidadId: 1,
      rutaId: 2n,
      mes: 8,
      creadoPor: 'admin',
    });
  });

  it('should reject a route that does not exist', async () => {
    mockRouteRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ periodoId: 3, rutaId: 999, mes: 8 }),
    ).rejects.toThrow(InvalidDomainOperationException);

    expect(mockRepository.generate).not.toHaveBeenCalled();
  });

  it('should reject a route that is not TOMA_LECTURA', async () => {
    mockRouteRepository.findById.mockResolvedValue({
      ...completedReadingRoute,
      tipoRuta: 'INSTALACION',
    });

    await expect(
      useCase.execute({ periodoId: 3, rutaId: 2, mes: 8 }),
    ).rejects.toThrow(/TOMA_LECTURA/);
  });

  it('should reject a route that is not COMPLETADA', async () => {
    mockRouteRepository.findById.mockResolvedValue({
      ...completedReadingRoute,
      estado: 'EN_PROGRESO',
    });

    await expect(
      useCase.execute({ periodoId: 3, rutaId: 2, mes: 8 }),
    ).rejects.toThrow(/COMPLETADA/);
  });

  it('should reject a route from a different period', async () => {
    mockRouteRepository.findById.mockResolvedValue(completedReadingRoute);

    await expect(
      useCase.execute({ periodoId: 5, rutaId: 2, mes: 8 }),
    ).rejects.toThrow(/período/);
  });

  it('should reject when a batch already exists for the route', async () => {
    mockRouteRepository.findById.mockResolvedValue(completedReadingRoute);
    mockRepository.count.mockResolvedValue(1);

    await expect(
      useCase.execute({ periodoId: 3, rutaId: 2, mes: 8 }),
    ).rejects.toThrow(/Ya existe un lote/);

    expect(mockRepository.generate).not.toHaveBeenCalled();
  });
});
