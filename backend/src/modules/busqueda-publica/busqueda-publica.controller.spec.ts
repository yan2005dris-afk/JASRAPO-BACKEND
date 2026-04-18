import { Test, TestingModule } from '@nestjs/testing';
import { BusquedaPublicaController } from './busqueda-publica.controller';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { PrismaService } from 'src/database/prisma.service';

describe('BusquedaPublicaController', () => {
  let controller: BusquedaPublicaController;

  const mockPrismaService = {
    clientes: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    contratos: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusquedaPublicaController],
      providers: [
        BusquedaPublicaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<BusquedaPublicaController>(
      BusquedaPublicaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
