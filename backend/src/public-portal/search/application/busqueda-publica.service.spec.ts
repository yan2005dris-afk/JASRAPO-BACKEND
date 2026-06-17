import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { PublicSearchUseCase } from './use-cases/public-search.use-case';
import { SearchDeudaPublicaUseCase } from './use-cases/search-deuda-publica.use-case';

describe('BusquedaPublicaService', () => {
  let service: BusquedaPublicaService;

  const mockPublicSearchUseCase = { execute: jest.fn() };
  const mockSearchDeudaUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusquedaPublicaService,
        { provide: PublicSearchUseCase, useValue: mockPublicSearchUseCase },
        {
          provide: SearchDeudaPublicaUseCase,
          useValue: mockSearchDeudaUseCase,
        },
      ],
    }).compile();

    service = module.get<BusquedaPublicaService>(BusquedaPublicaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('search() should route to the general search handler and not trigger the debt search handler', async () => {
    const expected = { data: [], meta: { total: 0, page: 1, limit: 10 } };
    mockPublicSearchUseCase.execute.mockResolvedValue(expected);

    const result = await service.search('cliente', 'juan', 1, 10);

    expect(mockPublicSearchUseCase.execute).toHaveBeenCalledWith(
      'cliente',
      'juan',
      1,
      10,
    );
    expect(mockSearchDeudaUseCase.execute).not.toHaveBeenCalled();
    expect(result).toBe(expected);
  });

  it('searchDeuda() should route to the debt search handler and not trigger the general search handler', async () => {
    const expected = { data: [], meta: { total: 0, page: 1, limit: 10 } };
    mockSearchDeudaUseCase.execute.mockResolvedValue(expected);

    const result = await service.searchDeuda(
      'identificacion',
      '0912345678',
      1,
      10,
    );

    expect(mockSearchDeudaUseCase.execute).toHaveBeenCalledWith(
      'identificacion',
      '0912345678',
      1,
      10,
    );
    expect(mockPublicSearchUseCase.execute).not.toHaveBeenCalled();
    expect(result).toBe(expected);
  });

  it('should apply default page=1 and limit=10 when search is called without those arguments', async () => {
    mockPublicSearchUseCase.execute.mockResolvedValue({ data: [], meta: {} });

    await service.search('cliente', 'juan');

    expect(mockPublicSearchUseCase.execute).toHaveBeenCalledWith(
      'cliente',
      'juan',
      1,
      10,
    );
  });

  it('should apply default page=1 and limit=10 when searchDeuda is called without those arguments', async () => {
    mockSearchDeudaUseCase.execute.mockResolvedValue({ data: [], meta: {} });

    await service.searchDeuda('identificacion', '0912345678');

    expect(mockSearchDeudaUseCase.execute).toHaveBeenCalledWith(
      'identificacion',
      '0912345678',
      1,
      10,
    );
  });
});
