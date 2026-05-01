import { Test, TestingModule } from '@nestjs/testing';
import { DeleteSectorUseCase } from './delete-sector.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('DeleteSectorUseCase', () => {
  let useCase: DeleteSectorUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    sectores: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSectorUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<DeleteSectorUseCase>(DeleteSectorUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a sector successfully', async () => {
    mockPrismaService.sectores.findUnique.mockResolvedValue({ sectorId: 1 });
    mockPrismaService.sectores.delete.mockResolvedValue({ sectorId: 1 });

    const result = await useCase.execute(1);

    expect(result).toEqual({
      message: 'Sector eliminado exitosamente.',
      statusCode: 200,
    });
    expect(prisma.sectores.findUnique).toHaveBeenCalledWith({
      where: { sectorId: 1 },
    });
    expect(prisma.sectores.delete).toHaveBeenCalledWith({
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
