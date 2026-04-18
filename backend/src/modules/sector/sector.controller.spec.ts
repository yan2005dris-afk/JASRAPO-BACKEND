import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SectorController } from './sector.controller';
import { SectorService } from './sector.service';
import { PrismaService } from 'src/database/prisma.service';

describe('SectorController', () => {
  let controller: SectorController;

  const mockPrismaService = {
    sectores: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    comunidades: {
      findUnique: jest.fn(),
    },
  } as any;

  const mockSectorService = {
    crearSector: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectorController],
      providers: [
        { provide: SectorService, useValue: mockSectorService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<SectorController>(SectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
