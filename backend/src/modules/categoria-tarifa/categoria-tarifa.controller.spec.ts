import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CategoriaTarifaController } from './categoria-tarifa.controller';
import { CategoriaTarifaService } from './categoria-tarifa.service';

describe('CategoriaTarifaController', () => {
  let controller: CategoriaTarifaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaTarifaController],
      providers: [
        {
          provide: CategoriaTarifaService,
          useValue: {
            createCategoria: jest.fn(),
            getCategorias: jest.fn(),
            buscarCategoriaPorNombre: jest.fn(),
            updateCategoria: jest.fn(),
            deleteCategoria: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriaTarifaController>(
      CategoriaTarifaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
