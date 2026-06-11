import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ContratoMedidorController } from './contrato-medidor.controller';
import { ContratoMedidorService } from '../../application/contrato-medidor.service';

describe('ContratoMedidorController', () => {
  let controller: ContratoMedidorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContratoMedidorController],
      providers: [
        {
          provide: ContratoMedidorService,
          useValue: {
            crearContrato: jest.fn(),
            buscarContratos: jest.fn(),
            buscarContrato: jest.fn(),
            actualizar: jest.fn(),
            finalizarVinculo: jest.fn(),
            eliminar: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContratoMedidorController>(
      ContratoMedidorController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
