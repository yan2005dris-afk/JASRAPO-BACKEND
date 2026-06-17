import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BusquedaPublicaController } from './busqueda-publica.controller';
import { BusquedaPublicaService } from '../../application/busqueda-publica.service';

describe('BusquedaPublicaController', () => {
  let controller: BusquedaPublicaController;

  const mockService = { search: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusquedaPublicaController],
      providers: [{ provide: BusquedaPublicaService, useValue: mockService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BusquedaPublicaController>(BusquedaPublicaController);
  });

  afterEach(() => jest.clearAllMocks());

  it('search() delegates to service with all query params', async () => {
    const expected = { data: [], meta: { total: 0, page: 1, limit: 10 } };
    mockService.search.mockResolvedValue(expected);

    const result = await controller.search({
      tipo: 'identificacion',
      valor: '0912345678',
      page: 1,
      limit: 10,
    });

    expect(mockService.search).toHaveBeenCalledWith('identificacion', '0912345678', 1, 10);
    expect(result).toBe(expected);
  });

  it('search() applies ?? fallbacks when page and limit are undefined', async () => {
    mockService.search.mockResolvedValue({ data: [], meta: {} });

    await controller.search({
      tipo: 'nombre',
      valor: 'Ana Torres',
      page: undefined as any,
      limit: undefined as any,
    });

    expect(mockService.search).toHaveBeenCalledWith('nombre', 'Ana Torres', 1, 10);
  });

  it('search() propagates errors from the service', async () => {
    mockService.search.mockRejectedValue(new Error('service failure'));

    await expect(
      controller.search({ tipo: 'numeroGuia', valor: 'GU-001', page: 1, limit: 10 }),
    ).rejects.toThrow('service failure');
  });
});
