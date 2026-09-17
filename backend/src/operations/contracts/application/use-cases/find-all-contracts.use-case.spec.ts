import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllContractsUseCase } from './find-all-contracts.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';

describe('FindAllContractsUseCase', () => {
  let useCase: FindAllContractsUseCase;

  const mockContractRepository = {
    paginateContratos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllContractsUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllContractsUseCase>(FindAllContractsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call paginateContratos with correct parameters', async () => {
    const paginatedResult = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        ultimaPagina: 0,
        paginaActual: 1,
        porPagina: 10,
        anterior: null,
        siguiente: null,
      },
    };
    mockContractRepository.paginateContratos.mockResolvedValue(paginatedResult);

    const result = await useCase.execute(1, 10);

    expect(result).toEqual(paginatedResult);
    expect(mockContractRepository.paginateContratos).toHaveBeenCalledWith(
      { filters: undefined, orderBy: { createdAt: 'desc' } },
      { page: 1, limit: 10 },
    );
  });

  it('should pass filters to paginateContratos', async () => {
    const filters = { estadoServicio: 'ACTIVO' as const, numeroGuia: 'GU-001' };
    const paginatedResult = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        ultimaPagina: 0,
        paginaActual: 1,
        porPagina: 10,
        anterior: null,
        siguiente: null,
      },
    };
    mockContractRepository.paginateContratos.mockResolvedValue(paginatedResult);

    await useCase.execute(1, 10, filters);

    expect(mockContractRepository.paginateContratos).toHaveBeenCalledWith(
      { filters, orderBy: { createdAt: 'desc' } },
      { page: 1, limit: 10 },
    );
  });
});
