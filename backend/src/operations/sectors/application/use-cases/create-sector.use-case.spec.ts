import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateSectorUseCase } from './create-sector.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { sectorRow } from '../../__test-utils__/sector-row.factory';

describe('CreateSectorUseCase', () => {
  let useCase: CreateSectorUseCase;

  const mockSectorRepository = {
    findById: jest.fn(),
    findByCodigo: jest.fn(),
    findComunidadById: jest.fn(),
    paginate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSectorUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<CreateSectorUseCase>(CreateSectorUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a sector successfully when comunidad exists', async () => {
    const dto = { nombre: 'Sector A', codigo: 'SEC-001', comunidadId: 1 };
    const expected = sectorRow({
      sectorId: 1,
      nombre: 'Sector A',
      codigo: 'SEC-001',
      comunidadId: 1,
    });

    mockSectorRepository.findComunidadById.mockResolvedValue({
      comunidadId: 1,
      codigo: 'COM-001',
      nombre: 'Comunidad 1',
    });
    mockSectorRepository.create.mockResolvedValue(expected);

    const result = await useCase.execute(dto);

    expect(result).toEqual(expected);
    expect(mockSectorRepository.findComunidadById).toHaveBeenCalledWith(1);
    expect(mockSectorRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should throw EntityNotFoundException if comunidad does not exist', async () => {
    const dto = { nombre: 'Sector A', codigo: 'SEC-001', comunidadId: 999 };
    mockSectorRepository.findComunidadById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(EntityNotFoundException);
  });
});
