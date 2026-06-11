import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetAllSectorsUseCase } from './get-all-sectors.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';

describe('GetAllSectorsUseCase', () => {
  let useCase: GetAllSectorsUseCase;

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
        GetAllSectorsUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<GetAllSectorsUseCase>(GetAllSectorsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all sectors', async () => {
    const mockSectors = [
      { sectorId: 1, nombre: 'Sector 1', comunidadId: 1 },
      { sectorId: 2, nombre: 'Sector 2', comunidadId: 1 },
    ];
    mockSectorRepository.findMany.mockResolvedValue(mockSectors);
    mockSectorRepository.count.mockResolvedValue(2);

    const result = await useCase.execute();

    expect(result.data).toEqual(mockSectors);
    expect(result.meta.total).toBe(2);
    expect(mockSectorRepository.findMany).toHaveBeenCalled();
    expect(mockSectorRepository.count).toHaveBeenCalled();
  });
});
