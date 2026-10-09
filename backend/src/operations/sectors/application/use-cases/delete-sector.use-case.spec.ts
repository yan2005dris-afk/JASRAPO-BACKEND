import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DeleteSectorUseCase } from './delete-sector.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { sectorRow } from '../../__test-utils__/sector-row.factory';

describe('DeleteSectorUseCase', () => {
  let useCase: DeleteSectorUseCase;

  const mockSectorRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSectorUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<DeleteSectorUseCase>(DeleteSectorUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a sector successfully when found', async () => {
    const existing = sectorRow({
      sectorId: 1,
      nombre: 'Sector 1',
      codigo: 'SEC-001',
    });
    const deleted = sectorRow({
      sectorId: 1,
      nombre: 'Sector 1',
      codigo: 'SEC-001',
      deletedAt: new Date(),
    });
    mockSectorRepository.findById.mockResolvedValue(existing);
    mockSectorRepository.softDelete.mockResolvedValue(deleted);

    const result = await useCase.execute(1);

    expect(result).toEqual(deleted);
    expect(mockSectorRepository.findById).toHaveBeenCalledWith(1);
    expect(mockSectorRepository.softDelete).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException if sector does not exist', async () => {
    mockSectorRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
  });
});
