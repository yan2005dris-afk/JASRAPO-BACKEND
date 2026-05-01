import { Test, TestingModule } from '@nestjs/testing';
import { FindOneFieldWorkUseCase } from './find-one-field-work.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NovedadOperativaEntity } from '../entities/novedad-operativa.entity';
import { NotFoundException } from '@nestjs/common';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/enums';

describe('FindOneFieldWorkUseCase', () => {
  let useCase: FindOneFieldWorkUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    novedadOperativa: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneFieldWorkUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<FindOneFieldWorkUseCase>(FindOneFieldWorkUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a field work by id', async () => {
    const mockNovedad = {
      novedadId: BigInt(1),
      lecturaId: BigInt(1),
      observacion: 'Test',
      tipo: TipoNovedad.FUGA,
      estado: EstadoNovedad.PENDIENTE,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(mockNovedad);

    const result = await useCase.execute(BigInt(1));

    expect(result).toBeInstanceOf(NovedadOperativaEntity);
    expect(result.novedadId).toBe('1');
  });

  it('should throw NotFoundException if not found', async () => {
    mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if deleted', async () => {
    mockPrismaService.novedadOperativa.findUnique.mockResolvedValue({
      novedadId: BigInt(1),
      deletedAt: new Date(),
    });

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
  });
});
