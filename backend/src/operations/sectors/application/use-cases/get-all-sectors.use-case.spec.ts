import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetAllSectorsUseCase } from './get-all-sectors.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { sectorRow } from '../../__test-utils__/sector-row.factory';

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
      sectorRow({ sectorId: 1, nombre: 'Sector 1', codigo: 'SEC-001' }),
      sectorRow({ sectorId: 2, nombre: 'Sector 2', codigo: 'SEC-002' }),
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
