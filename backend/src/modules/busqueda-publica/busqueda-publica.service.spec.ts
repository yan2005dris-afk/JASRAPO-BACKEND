import { Test, TestingModule } from '@nestjs/testing';
import { BusquedaPublicaService } from './busqueda-publica.service';

describe('BusquedaPublicaService', () => {
  let service: BusquedaPublicaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusquedaPublicaService],
    }).compile();

    service = module.get<BusquedaPublicaService>(BusquedaPublicaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
