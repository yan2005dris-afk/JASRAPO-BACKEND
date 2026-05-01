import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { PublicSearchUseCase } from './use-cases/public-search.use-case';

describe('BusquedaPublicaService', () => {
  let service: BusquedaPublicaService;
  let publicSearchUseCase: PublicSearchUseCase;

  const mockUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusquedaPublicaService,
        { provide: PublicSearchUseCase, useValue: mockUseCase },
      ],
    }).compile();

    service = module.get<BusquedaPublicaService>(BusquedaPublicaService);
    publicSearchUseCase = module.get<PublicSearchUseCase>(PublicSearchUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should delegate to PublicSearchUseCase', async () => {
      const tipo = 'cliente';
      const valor = 'test';
      const page = 1;
      const limit = 10;
      await service.search(tipo, valor, page, limit);
      expect(publicSearchUseCase.execute).toHaveBeenCalledWith(tipo, valor, page, limit);
    });
  });
});
