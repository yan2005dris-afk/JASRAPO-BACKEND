import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllCommunitiesWithSectorUseCase } from './find-all-communities-with-sector.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';

describe('FindAllCommunitiesWithSectorUseCase', () => {
  let useCase: FindAllCommunitiesWithSectorUseCase;
  let communityRepository: CommunityRepository;

  const mockRepository = {
    findMany: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllCommunitiesWithSectorUseCase,
        { provide: CommunityRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindAllCommunitiesWithSectorUseCase>(
      FindAllCommunitiesWithSectorUseCase,
    );
    communityRepository = module.get<CommunityRepository>(CommunityRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated results without sector filter', async () => {
    const mockData = [
      { comunidadId: 1, nombre: 'Comunidad A', codigo: 'CA-001' },
    ] as any;
    mockRepository.findMany.mockResolvedValue(mockData);
    mockRepository.count.mockResolvedValue(5);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(mockRepository.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      skip: 0,
      take: 10,
    });
    expect(result.data).toEqual(mockData);
    expect(result.meta.total).toBe(5);
    expect(result.meta.page).toBe(1);
  });

  it('should filter by sectorId when provided', async () => {
    mockRepository.findMany.mockResolvedValue([]);
    mockRepository.count.mockResolvedValue(3);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      sectorId: 5,
    });

    expect(mockRepository.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        sector: {
          some: { sectorId: 5, deletedAt: null },
        },
      },
      skip: 0,
      take: 10,
    });
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        sector: {
          some: { sectorId: 5, deletedAt: null },
        },
      },
    });
    expect(result.meta.total).toBe(3);
  });

  it('should use custom pagination when provided', async () => {
    mockRepository.findMany.mockResolvedValue([]);
    mockRepository.count.mockResolvedValue(20);

    const result = await useCase.execute({ page: 2, limit: 5, sectorId: 1 });

    expect(mockRepository.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        sector: { some: { sectorId: 1, deletedAt: null } },
      },
      skip: 5,
      take: 5,
    });
    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(5);
    expect(result.meta.ultimaPagina).toBe(4);
  });
});
