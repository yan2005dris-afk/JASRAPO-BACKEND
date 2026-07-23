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
    const expected = {
      cliente: { nombre: 'Juan', identificacion: '0912345678' },
      contratos: [],
      totalDeuda: 0,
    };
    mockSearchDeudaUseCase.execute.mockResolvedValue(expected);

    const result = await service.search('identificacion', '0912345678');

    expect(mockSearchDeudaUseCase.execute).toHaveBeenCalledWith(
      'identificacion',
      '0912345678',
    );
    expect(result).toBe(expected);
  });
});
