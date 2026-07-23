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

    controller = module.get<BusquedaPublicaController>(
      BusquedaPublicaController,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('search() delegates to service with query params', async () => {
    const expected = {
      cliente: { nombre: 'Juan', identificacion: '0912345678' },
      contratos: [],
      totalDeuda: 0,
    };
    mockService.search.mockResolvedValue(expected);

    const result = await controller.search({
      tipo: 'identificacion',
      valor: '0912345678',
    });

    expect(mockService.search).toHaveBeenCalledWith(
      'identificacion',
      '0912345678',
    );
    expect(result).toBe(expected);
  });

  it('search() propagates errors from the service', async () => {
    mockService.search.mockRejectedValue(new Error('service failure'));

    await expect(
      controller.search({
        tipo: 'numeroGuia',
        valor: 'GU-001',
      }),
    ).rejects.toThrow('service failure');
  });
});
