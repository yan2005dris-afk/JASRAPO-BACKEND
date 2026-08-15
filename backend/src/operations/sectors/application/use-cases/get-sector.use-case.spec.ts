import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetSectorUseCase } from './get-sector.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { SectorEntity } from '../../domain/entities/sector.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('GetSectorUseCase', () => {
  let useCase: GetSectorUseCase;

  const mockSectorRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSectorUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<GetSectorUseCase>(GetSectorUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a sector if it exists', async () => {
    const mockSector = new SectorEntity(1, 'Sector 1', 'SEC-001', 1);
    mockSectorRepository.findById.mockResolvedValue(mockSector);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockSector);
    expect(mockSectorRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException if sector does not exist', async () => {
    mockSectorRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
  });
});
