import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { PrismaService } from 'src/database/prisma.service';

describe('BusquedaPublicaService', () => {
  let service: BusquedaPublicaService;

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
      providers: [
        BusquedaPublicaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BusquedaPublicaService>(BusquedaPublicaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
