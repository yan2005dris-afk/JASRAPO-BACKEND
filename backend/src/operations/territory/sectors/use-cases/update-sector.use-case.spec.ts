import { Test, TestingModule } from '@nestjs/testing';
import { UpdateSectorUseCase } from './update-sector.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('UpdateSectorUseCase', () => {
  let useCase: UpdateSectorUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    sectores: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSectorUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<UpdateSectorUseCase>(UpdateSectorUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a sector successfully', async () => {
    const dto = { nombre: 'Sector Updated' };
    const mockUpdatedSector = { sectorId: 1, nombre: 'Sector Updated', comunidadId: 1 };
    mockPrismaService.sectores.update.mockResolvedValue(mockUpdatedSector);

    const result = await useCase.execute(1, dto as any);

    expect(result).toEqual(mockUpdatedSector);
    expect(prisma.sectores.update).toHaveBeenCalledWith({
      where: { sectorId: 1 },
      data: dto,
    });
  });
});
