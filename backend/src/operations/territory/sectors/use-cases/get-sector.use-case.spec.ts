import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetSectorUseCase } from './get-sector.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GetSectorUseCase', () => {
  let useCase: GetSectorUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    sectores: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSectorUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<GetSectorUseCase>(GetSectorUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a sector if it exists', async () => {
    const mockSector = { sectorId: 1, nombre: 'Sector 1', comunidadId: 1 };
    mockPrismaService.sectores.findUnique.mockResolvedValue(mockSector);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockSector);
    expect(prisma.sectores.findUnique).toHaveBeenCalledWith({
      where: { sectorId: 1 },
    });
  });

  it('should throw NotFoundException if sector does not exist', async () => {
    mockPrismaService.sectores.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      new NotFoundException('Sector con ID 999 no encontrado'),
    );
  });
});
