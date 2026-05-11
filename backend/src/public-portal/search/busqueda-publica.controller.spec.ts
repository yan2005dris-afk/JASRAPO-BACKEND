import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BusquedaPublicaController } from './busqueda-publica.controller';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { PublicSearchUseCase } from './use-cases/public-search.use-case';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('BusquedaPublicaController', () => {
  let controller: BusquedaPublicaController;

  const mockPublicSearchUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusquedaPublicaController],
      providers: [
        BusquedaPublicaService,
        { provide: PublicSearchUseCase, useValue: mockPublicSearchUseCase },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BusquedaPublicaController>(
      BusquedaPublicaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
