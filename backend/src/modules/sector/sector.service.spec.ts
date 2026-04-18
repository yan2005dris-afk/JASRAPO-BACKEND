import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SectorService } from './sector.service';
import { PrismaService } from 'src/database/prisma.service';

describe('SectorService', () => {
  let service: SectorService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectorService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SectorService>(SectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});