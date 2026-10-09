import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateSectorUseCase } from './update-sector.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { sectorRow } from '../../__test-utils__/sector-row.factory';

describe('UpdateSectorUseCase', () => {
  let useCase: UpdateSectorUseCase;

  const mockSectorRepository = {
    findById: jest.fn(),
    findComunidadById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSectorUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<UpdateSectorUseCase>(UpdateSectorUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a sector successfully', async () => {
    const dto = { nombre: 'Sector Updated' };
    const mockExistingSector = sectorRow({
      sectorId: 1,
      nombre: 'Old',
      codigo: 'SEC-001',
    });
    const mockUpdatedSector = sectorRow({
      sectorId: 1,
      nombre: 'Sector Updated',
      codigo: 'SEC-001',
    });

    mockSectorRepository.findById.mockResolvedValue(mockExistingSector);
    mockSectorRepository.update.mockResolvedValue(mockUpdatedSector);

    const result = await useCase.execute(1, dto);

    expect(result).toEqual(mockUpdatedSector);
    expect(mockSectorRepository.findById).toHaveBeenCalledWith(1);
    expect(mockSectorRepository.update).toHaveBeenCalledWith(1, dto);
  });

  it('should throw EntityNotFoundException if sector does not exist', async () => {
    mockSectorRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, { nombre: 'Test' })).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw EntityNotFoundException if updated comunidadId does not exist', async () => {
    const mockExistingSector = sectorRow({
      sectorId: 1,
      nombre: 'Old',
      codigo: 'SEC-001',
    });
    mockSectorRepository.findById.mockResolvedValue(mockExistingSector);
    mockSectorRepository.findComunidadById.mockResolvedValue(null);

    await expect(useCase.execute(1, { comunidadId: 999 })).rejects.toThrow(
      EntityNotFoundException,
    );
  });
});
