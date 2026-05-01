import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetAllSectorsUseCase } from './get-all-sectors.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('GetAllSectorsUseCase', () => {
  let useCase: GetAllSectorsUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    sectores: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllSectorsUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<GetAllSectorsUseCase>(GetAllSectorsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all sectors', async () => {
    const mockSectors = [
      { sectorId: 1, nombre: 'Sector 1', comunidadId: 1 },
      { sectorId: 2, nombre: 'Sector 2', comunidadId: 1 },
    ];
    mockPrismaService.sectores.findMany.mockResolvedValue(mockSectors);

    const result = await useCase.execute();

    expect(result).toEqual(mockSectors);
    expect(prisma.sectores.findMany).toHaveBeenCalled();
  });
});
