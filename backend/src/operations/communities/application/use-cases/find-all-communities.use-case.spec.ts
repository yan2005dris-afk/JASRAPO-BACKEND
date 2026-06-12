import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllCommunitiesUseCase } from './find-all-communities.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';

describe('FindAllCommunitiesUseCase', () => {
  let useCase: FindAllCommunitiesUseCase;
  let communityRepository: CommunityRepository;

  const mockRepository = {
    findMany: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllCommunitiesUseCase,
        { provide: CommunityRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindAllCommunitiesUseCase>(FindAllCommunitiesUseCase);
    communityRepository = module.get<CommunityRepository>(CommunityRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated results with default page and limit', async () => {
    const mockData = [
      { comunidadId: 1, nombre: 'Comunidad A', codigo: 'CA-001' },
      { comunidadId: 2, nombre: 'Comunidad B', codigo: 'CB-002' },
    ] as any;
    mockRepository.findMany.mockResolvedValue(mockData);
    mockRepository.count.mockResolvedValue(10);

    const result = await useCase.execute();

    expect(mockRepository.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      skip: 0,
      take: 10,
    });
    expect(mockRepository.count).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
    expect(result.data).toEqual(mockData);
    expect(result.meta.total).toBe(10);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.ultimaPagina).toBe(1);
    expect(result.meta.paginaActual).toBe(1);
    expect(result.meta.porPagina).toBe(10);
    expect(result.meta.anterior).toBeNull();
    expect(result.meta.siguiente).toBeNull();
  });

  it('should use custom page and limit when provided', async () => {
    mockRepository.findMany.mockResolvedValue([]);
    mockRepository.count.mockResolvedValue(25);

    const result = await useCase.execute(3, 5);

    expect(mockRepository.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      skip: 10,
      take: 5,
    });
    expect(result.meta.page).toBe(3);
    expect(result.meta.limit).toBe(5);
    expect(result.meta.ultimaPagina).toBe(5);
  });

  it('should return correct previous and next page links', async () => {
    mockRepository.findMany.mockResolvedValue([]);
    mockRepository.count.mockResolvedValue(50);

    const page2 = await useCase.execute(2, 10);
    expect(page2.meta.anterior).toBe(1);
    expect(page2.meta.siguiente).toBe(3);
    expect(page2.meta.ultimaPagina).toBe(5);

    const firstPage = await useCase.execute(1, 10);
    expect(firstPage.meta.anterior).toBeNull();
    expect(firstPage.meta.siguiente).toBe(2);
  });
});
