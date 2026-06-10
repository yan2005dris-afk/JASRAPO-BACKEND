import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ComunidadController } from './comunidad.controller';
import { ComunidadService } from '../../application/comunidad.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('ComunidadController', () => {
  let controller: ComunidadController;

  const mockPrismaService = {
    comunidades: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  const mockComunidadService = {
    crearComunidad: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComunidadController],
      providers: [
        { provide: ComunidadService, useValue: mockComunidadService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<ComunidadController>(ComunidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
