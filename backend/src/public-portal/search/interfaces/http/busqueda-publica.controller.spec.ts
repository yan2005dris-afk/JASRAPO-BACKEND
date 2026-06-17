import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BusquedaPublicaController } from './busqueda-publica.controller';
import { BusquedaPublicaService } from '../../application/busqueda-publica.service';

describe('BusquedaPublicaController', () => {
  let controller: BusquedaPublicaController;

  const mockService = {
    search: jest.fn(),
    searchDeuda: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusquedaPublicaController],
      providers: [
        { provide: BusquedaPublicaService, useValue: mockService },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BusquedaPublicaController>(BusquedaPublicaController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('searchPublic', () => {
    it('should call service.search with query params and return its result', async () => {
      const expected = { data: [], meta: { total: 0, page: 2, limit: 20 } };
      mockService.search.mockResolvedValue(expected);

      const result = await controller.searchPublic({
        tipo: 'cliente',
        valor: 'juan',
        page: 2,
        limit: 20,
      });

      expect(mockService.search).toHaveBeenCalledWith('cliente', 'juan', 2, 20);
      expect(result).toBe(expected);
    });

    it('should apply ?? fallbacks when page and limit are undefined in the query object', async () => {
      mockService.search.mockResolvedValue({ data: [], meta: {} });

      await controller.searchPublic({
        tipo: 'contrato',
        valor: 'G-001',
        page: undefined as any,
        limit: undefined as any,
      });

      expect(mockService.search).toHaveBeenCalledWith('contrato', 'G-001', 1, 10);
    });

    it('should propagate errors thrown by the service', async () => {
      mockService.search.mockRejectedValue(new Error('service failure'));

      await expect(
        controller.searchPublic({ tipo: 'cliente', valor: 'juan', page: 1, limit: 10 }),
      ).rejects.toThrow('service failure');
    });
  });

  describe('searchDeuda', () => {
    it('should call service.searchDeuda with query params and return its result', async () => {
      const expected = { data: [], meta: { total: 1, page: 1, limit: 5 } };
      mockService.searchDeuda.mockResolvedValue(expected);

      const result = await controller.searchDeuda({
        tipo: 'identificacion',
        valor: '0912345678',
        page: 1,
        limit: 5,
      });

      expect(mockService.searchDeuda).toHaveBeenCalledWith('identificacion', '0912345678', 1, 5);
      expect(result).toBe(expected);
    });

    it('should apply ?? fallbacks when page and limit are undefined in the query object', async () => {
      mockService.searchDeuda.mockResolvedValue({ data: [], meta: {} });

      await controller.searchDeuda({
        tipo: 'nombre',
        valor: 'Ana Torres',
        page: undefined as any,
        limit: undefined as any,
      });

      expect(mockService.searchDeuda).toHaveBeenCalledWith('nombre', 'Ana Torres', 1, 10);
    });

    it('should propagate errors thrown by the service', async () => {
      mockService.searchDeuda.mockRejectedValue(new Error('service failure'));

      await expect(
        controller.searchDeuda({ tipo: 'identificacion', valor: '0912345678', page: 1, limit: 10 }),
      ).rejects.toThrow('service failure');
    });
  });
});
