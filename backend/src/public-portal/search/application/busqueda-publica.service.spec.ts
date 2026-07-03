import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { SearchDeudaPublicaUseCase } from './use-cases/search-deuda-publica.use-case';

describe('BusquedaPublicaService', () => {
  let service: BusquedaPublicaService;
  const mockSearchDeudaUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusquedaPublicaService,
        {
          provide: SearchDeudaPublicaUseCase,
          useValue: mockSearchDeudaUseCase,
        },
      ],
    }).compile();

    service = module.get<BusquedaPublicaService>(BusquedaPublicaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('search() delegates to SearchDeudaPublicaUseCase', async () => {
    const expected = { data: [], meta: { total: 0, page: 1, limit: 10 } };
    mockSearchDeudaUseCase.execute.mockResolvedValue(expected);

    const result = await service.search('identificacion', '0912345678', 1, 10);

    expect(mockSearchDeudaUseCase.execute).toHaveBeenCalledWith(
      'identificacion',
      '0912345678',
      1,
      10,
    );
    expect(result).toBe(expected);
  });

  it('search() defaults page=1 and limit=10', async () => {
    mockSearchDeudaUseCase.execute.mockResolvedValue({ data: [], meta: {} });

    await service.search('nombre', 'Juan');

    expect(mockSearchDeudaUseCase.execute).toHaveBeenCalledWith(
      'nombre',
      'Juan',
      1,
      10,
    );
  });
});
