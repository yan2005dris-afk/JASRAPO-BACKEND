import { Test, TestingModule } from '@nestjs/testing';
import { FindAllFieldWorksUseCase } from './find-all-field-works.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NovedadOperativaEntity } from '../entities/novedad-operativa.entity';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/enums';

describe('FindAllFieldWorksUseCase', () => {
  let useCase: FindAllFieldWorksUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    novedadOperativa: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllFieldWorksUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<FindAllFieldWorksUseCase>(FindAllFieldWorksUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all field works', async () => {
    const mockNovedades = [
      {
        novedadId: BigInt(1),
        lecturaId: BigInt(1),
        observacion: 'Test',
        tipo: TipoNovedad.FUGA,
        estado: EstadoNovedad.PENDIENTE,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    mockPrismaService.novedadOperativa.findMany.mockResolvedValue(mockNovedades);

    const result = await useCase.execute({});

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(NovedadOperativaEntity);
    expect(mockPrismaService.novedadOperativa.findMany).toHaveBeenCalledWith({
      skip: undefined,
      take: undefined,
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should apply filters and pagination', async () => {
    mockPrismaService.novedadOperativa.findMany.mockResolvedValue([]);

    await useCase.execute({ skip: 0, take: 10, where: { tipo: TipoNovedad.FUGA } });

    expect(mockPrismaService.novedadOperativa.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { tipo: TipoNovedad.FUGA, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });
});
