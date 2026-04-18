import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NovedadOperativaController } from './novedad-operativa.controller';
import { NovedadOperativaService } from './novedad-operativa.service';

describe('NovedadOperativaController', () => {
  let controller: NovedadOperativaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NovedadOperativaController],
      providers: [
        {
          provide: NovedadOperativaService,
          useValue: {
            crearNovedadOperativa: jest.fn(),
            buscarNovedades: jest.fn(),
            buscarNovedad: jest.fn(),
            actualizarNovedad: jest.fn(),
            eliminarNovedad: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NovedadOperativaController>(NovedadOperativaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});