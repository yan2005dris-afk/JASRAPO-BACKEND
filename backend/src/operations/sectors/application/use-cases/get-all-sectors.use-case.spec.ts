import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetAllSectorsUseCase } from './get-all-sectors.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { SectorEntity } from '../../domain/entities/sector.entity';

describe('GetAllSectorsUseCase', () => {
  let useCase: GetAllSectorsUseCase;

  const mockSectorRepository = {
    paginate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllSectorsUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<GetAllSectorsUseCase>(GetAllSectorsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return paginated sectors', async () => {
    const mockSectors = [
      new SectorEntity(1, 'Sector 1', 'SEC-001', 1),
      new SectorEntity(2, 'Sector 2', 'SEC-002', 1),
    ];
    mockSectorRepository.paginate.mockResolvedValue({
      data: mockSectors,
      total: 2,
    });

    const result = await useCase.execute();

    expect(result.data).toEqual(mockSectors);
    expect(result.meta.total).toBe(2);
    expect(mockSectorRepository.paginate).toHaveBeenCalledWith(
      {},
      { skip: 0, take: 10 },
    );
  });
});
