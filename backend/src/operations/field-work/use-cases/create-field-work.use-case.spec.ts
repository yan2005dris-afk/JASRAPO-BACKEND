import { Test, TestingModule } from '@nestjs/testing';
import { CreateFieldWorkUseCase } from './create-field-work.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/enums';
import { NovedadOperativaEntity } from '../entities/novedad-operativa.entity';

describe('CreateFieldWorkUseCase', () => {
  let useCase: CreateFieldWorkUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    novedadOperativa: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFieldWorkUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateFieldWorkUseCase>(CreateFieldWorkUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a field work (novedad operativa)', async () => {
    const dto = {
      lecturaId: '1',
      observacion: 'Test observation',
      tipo: TipoNovedad.FUGA,
      estado: EstadoNovedad.PENDIENTE,
    };

    const mockCreated = {
      novedadId: BigInt(1),
      lecturaId: BigInt(1),
      observacion: 'Test observation',
      tipo: TipoNovedad.FUGA,
      estado: EstadoNovedad.PENDIENTE,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockPrismaService.novedadOperativa.create.mockResolvedValue(mockCreated);

    const result = await useCase.execute(dto);

    expect(result).toBeInstanceOf(NovedadOperativaEntity);
    expect(result.tipo).toBe(TipoNovedad.FUGA);
    expect(mockPrismaService.novedadOperativa.create).toHaveBeenCalledWith({
      data: {
        lecturaId: BigInt(dto.lecturaId),
        observacion: dto.observacion,
        tipo: dto.tipo,
        estado: dto.estado,
      },
    });
  });
});
