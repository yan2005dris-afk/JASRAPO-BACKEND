import { Test, TestingModule } from '@nestjs/testing';
import { BusquedaPublicaController } from './busqueda-publica.controller';
import { BusquedaPublicaService } from './busqueda-publica.service';

describe('BusquedaPublicaController', () => {
  let controller: BusquedaPublicaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusquedaPublicaController],
      providers: [BusquedaPublicaService],
    }).compile();

    controller = module.get<BusquedaPublicaController>(BusquedaPublicaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
