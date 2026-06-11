import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateSectorUseCase } from './create-sector.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CreateSectorUseCase', () => {
  let useCase: CreateSectorUseCase;

  const mockSectorRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findComunidad: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSectorUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<CreateSectorUseCase>(CreateSectorUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a sector successfully', async () => {
    const dto = { nombre: 'Sector A', comunidadId: 1 };
    mockSectorRepository.findComunidad.mockResolvedValue({
      comunidadId: 1,
    });
    mockSectorRepository.create.mockResolvedValue({
      sectorId: 1,
      ...dto,
    });

    const result = await useCase.execute(dto as any);

    expect(result).toEqual({
      message: 'Sector creado exitosamente.',
      statusCode: 201,
    });
    expect(mockSectorRepository.findComunidad).toHaveBeenCalledWith({
      comunidadId: 1,
    });
    expect(mockSectorRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should throw NotFoundException if comunidad does not exist', async () => {
    const dto = { nombre: 'Sector A', comunidadId: 999 };
    mockSectorRepository.findComunidad.mockResolvedValue(null);

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      new NotFoundException('La comunidad especificada no existe.'),
    );
  });

  it('should throw ConflictException if sector already exists (P2002)', async () => {
    const dto = { nombre: 'Sector A', comunidadId: 1 };
    mockSectorRepository.findComunidad.mockResolvedValue({
      comunidadId: 1,
    });
    const error = new Error();
    (error as any).code = 'P2002';
    mockSectorRepository.create.mockRejectedValue(error);

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      new ConflictException('El sector ya existe (código o ID duplicado).'),
    );
  });

  it('should rethrow other errors', async () => {
    const dto = { nombre: 'Sector A', comunidadId: 1 };
    mockSectorRepository.findComunidad.mockResolvedValue({
      comunidadId: 1,
    });
    const error = new Error('Database error');
    mockSectorRepository.create.mockRejectedValue(error);

    await expect(useCase.execute(dto as any)).rejects.toThrow('Database error');
  });
});
