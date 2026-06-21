import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetOperatorTasksUseCase } from './get-operator-tasks.use-case';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

describe('GetOperatorTasksUseCase', () => {
  let useCase: GetOperatorTasksUseCase;

  const mockOperatorRepository = {
    findActivePeriod: jest.fn(),
    findTasksByOperator: jest.fn(),
    findMedidoresById: jest.fn(),
  };

  const mockActivePeriod = { periodoId: 10 };

  const mockTasks = [
    {
      rutaId: BigInt(1),
      nombre: 'Instalacion MED-001',
      descripcion: 'Instalar medidor',
      tipoRuta: 'INSTALACION',
      estado: 'PENDIENTE',
      orden: 1,
      comunidadId: 5,
      sectorId: 3,
      operarioId: 42,
      medidorId: BigInt(100),
      observacion: null,
      fechaLimite: null,
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
      periodoId: 10,
    },
    {
      rutaId: BigInt(2),
      nombre: 'Lectura sector 3',
      descripcion: null,
      tipoRuta: 'TOMA_LECTURA',
      estado: 'EN_PROGRESO',
      orden: 2,
      comunidadId: 5,
      sectorId: 3,
      operarioId: 42,
      medidorId: null,
      observacion: null,
      fechaLimite: null,
      fechaPlanificada: null,
      fechaInicio: new Date(),
      fechaFin: null,
      periodoId: 10,
    },
  ];

  const mockMedidores = [
    {
      medidorId: BigInt(100),
      serie: 'MED-001',
      marca: 'Itron',
      modelo: 'CX1000',
      latitud: -33.45,
      longitud: -70.66,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOperatorTasksUseCase,
        { provide: OperatorRepository, useValue: mockOperatorRepository },
      ],
    }).compile();

    useCase = module.get<GetOperatorTasksUseCase>(GetOperatorTasksUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return enriched tasks for the operator ordered by comunidad/sector/orden', async () => {
    mockOperatorRepository.findActivePeriod.mockResolvedValue(mockActivePeriod);
    mockOperatorRepository.findTasksByOperator.mockResolvedValue(mockTasks);
    mockOperatorRepository.findMedidoresById.mockResolvedValue(mockMedidores);

    const result = await useCase.execute(42);

    expect(mockOperatorRepository.findActivePeriod).toHaveBeenCalled();
    expect(mockOperatorRepository.findTasksByOperator).toHaveBeenCalledWith(
      42,
      10,
      undefined,
    );
    expect(mockOperatorRepository.findMedidoresById).toHaveBeenCalledWith([
      BigInt(100),
    ]);

    expect(result).toHaveLength(2);

    expect(result[0].rutaId).toBe('1');
    expect(result[0].tipoRuta).toBe('INSTALACION');
    expect(result[0].estado).toBe('PENDIENTE');
    expect(result[0].medidor).toBeDefined();
    expect(result[0].medidor!.medidorId).toBe('100');
    expect(result[0].medidor!.serie).toBe('MED-001');

    expect(result[1].rutaId).toBe('2');
    expect(result[1].medidor).toBeNull();
  });

  it('should return empty array when operator has no tasks', async () => {
    mockOperatorRepository.findActivePeriod.mockResolvedValue(mockActivePeriod);
    mockOperatorRepository.findTasksByOperator.mockResolvedValue([]);

    const result = await useCase.execute(42);

    expect(result).toEqual([]);
    expect(mockOperatorRepository.findMedidoresById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when no active period exists', async () => {
    mockOperatorRepository.findActivePeriod.mockResolvedValue(null);

    await expect(useCase.execute(42)).rejects.toThrow(NotFoundException);
    expect(mockOperatorRepository.findTasksByOperator).not.toHaveBeenCalled();
  });

  it('should include operario info in each task', async () => {
    mockOperatorRepository.findActivePeriod.mockResolvedValue(mockActivePeriod);
    mockOperatorRepository.findTasksByOperator.mockResolvedValue(mockTasks);
    mockOperatorRepository.findMedidoresById.mockResolvedValue(mockMedidores);

    const result = await useCase.execute(42);

    expect(result[0].operario).toBeDefined();
    expect(result[0].operario!.usuarioId).toBe(42);
  });

  it('should pass tipoRuta filter to repository when provided', async () => {
    mockOperatorRepository.findActivePeriod.mockResolvedValue(mockActivePeriod);
    mockOperatorRepository.findTasksByOperator.mockResolvedValue([
      mockTasks[0],
    ]);
    mockOperatorRepository.findMedidoresById.mockResolvedValue(mockMedidores);

    const result = await useCase.execute(42, 'INSTALACION');

    expect(mockOperatorRepository.findTasksByOperator).toHaveBeenCalledWith(
      42,
      10,
      'INSTALACION',
    );
    expect(result).toHaveLength(1);
    expect(result[0].tipoRuta).toBe('INSTALACION');
  });

  it('should pass undefined tipoRuta filter to repository when not provided', async () => {
    mockOperatorRepository.findActivePeriod.mockResolvedValue(mockActivePeriod);
    mockOperatorRepository.findTasksByOperator.mockResolvedValue(mockTasks);
    mockOperatorRepository.findMedidoresById.mockResolvedValue(mockMedidores);

    await useCase.execute(42);

    expect(mockOperatorRepository.findTasksByOperator).toHaveBeenCalledWith(
      42,
      10,
      undefined,
    );
  });
});
