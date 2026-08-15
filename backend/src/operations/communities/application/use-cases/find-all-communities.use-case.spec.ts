import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllCommunitiesUseCase } from './find-all-communities.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';

describe('FindAllCommunitiesUseCase', () => {
  let useCase: FindAllCommunitiesUseCase;

  const mockRepository = {
    paginate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllCommunitiesUseCase,
        { provide: CommunityRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<FindAllCommunitiesUseCase>(FindAllCommunitiesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated results with default page and limit', async () => {
    const mockData = [
      new CommunityEntity({ comunidadId: 1, nombre: 'Comunidad A', codigo: 'CA-001' }),
      new CommunityEntity({ comunidadId: 2, nombre: 'Comunidad B', codigo: 'CB-002' }),
    ];
    mockRepository.paginate.mockResolvedValue({
      data: mockData,
      total: 10,
    });

    const result = await useCase.execute();

    expect(mockRepository.paginate).toHaveBeenCalledWith(
      { nombre: undefined, codigo: undefined },
      { skip: 0, take: 10 },
    );
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
    mockRepository.paginate.mockResolvedValue({
      data: [],
      total: 25,
    });

    const result = await useCase.execute(3, 5);

    expect(mockRepository.paginate).toHaveBeenCalledWith(
      { nombre: undefined, codigo: undefined },
      { skip: 10, take: 5 },
    );
    expect(result.meta.page).toBe(3);
    expect(result.meta.limit).toBe(5);
    expect(result.meta.ultimaPagina).toBe(5);
  });

  it('should pass filters to paginate', async () => {
    mockRepository.paginate.mockResolvedValue({
      data: [],
      total: 0,
    });

    const result = await useCase.execute(1, 10, {
      nombre: 'test',
      codigo: 'TC-001',
    });

    expect(mockRepository.paginate).toHaveBeenCalledWith(
      { nombre: 'test', codigo: 'TC-001' },
      { skip: 0, take: 10 },
    );
    expect(result.meta.total).toBe(0);
  });
});
