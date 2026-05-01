import { Test, TestingModule } from '@nestjs/testing';
import { FindAllTariffCategoriesUseCase } from './find-all-tariff-categories.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FindAllTariffCategoriesUseCase', () => {
  let useCase: FindAllTariffCategoriesUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    categoriaTarifa: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllTariffCategoriesUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<FindAllTariffCategoriesUseCase>(FindAllTariffCategoriesUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all active tariff categories', async () => {
    mockPrismaService.categoriaTarifa.findMany.mockResolvedValue([{ categoriaTarifaId: 1, nombre: 'Residencial' }]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(mockPrismaService.categoriaTarifa.findMany).toHaveBeenCalledWith({
      where: {
        activo: true,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should filter by name if provided', async () => {
    mockPrismaService.categoriaTarifa.findMany.mockResolvedValue([{ categoriaTarifaId: 1, nombre: 'Residencial' }]);

    await useCase.execute('residencial');

    expect(mockPrismaService.categoriaTarifa.findMany).toHaveBeenCalledWith({
      where: {
        activo: true,
        deletedAt: null,
        nombre: {
          contains: 'residencial',
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});
