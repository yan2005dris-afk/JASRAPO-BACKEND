import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ComunidadService } from './comunidad.service';
import { PrismaService } from 'src/database/prisma.service';

describe('ComunidadService', () => {
  let service: ComunidadService;

  const mockPrismaService = {
    comunidades: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunidadService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ComunidadService>(ComunidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
