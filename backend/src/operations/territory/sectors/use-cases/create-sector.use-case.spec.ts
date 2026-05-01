import { Test, TestingModule } from '@nestjs/testing';
import { CreateSectorUseCase } from './create-sector.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CreateSectorUseCase', () => {
  let useCase: CreateSectorUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    comunidades: {
      findUnique: jest.fn(),
    },
    sectores: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSectorUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<CreateSectorUseCase>(CreateSectorUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a sector successfully', async () => {
    const dto = { nombre: 'Sector A', comunidadId: 1 };
    mockPrismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    mockPrismaService.sectores.create.mockResolvedValue({ sectorId: 1, ...dto });

    const result = await useCase.execute(dto as any);

    expect(result).toEqual({
      message: 'Sector creado exitosamente.',
      statusCode: 201,
    });
    expect(prisma.comunidades.findUnique).toHaveBeenCalledWith({
      where: { comunidadId: 1 },
    });
    expect(prisma.sectores.create).toHaveBeenCalledWith({
      data: dto,
    });
  });

  it('should throw NotFoundException if comunidad does not exist', async () => {
    const dto = { nombre: 'Sector A', comunidadId: 999 };
    mockPrismaService.comunidades.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      new NotFoundException('La comunidad especificada no existe.'),
    );
  });

  it('should throw ConflictException if sector already exists (P2002)', async () => {
    const dto = { nombre: 'Sector A', comunidadId: 1 };
    mockPrismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    const error = new Error();
    (error as any).code = 'P2002';
    mockPrismaService.sectores.create.mockRejectedValue(error);

    await expect(useCase.execute(dto as any)).rejects.toThrow(
      new ConflictException('El sector ya existe (código o ID duplicado).'),
    );
  });

  it('should rethrow other errors', async () => {
    const dto = { nombre: 'Sector A', comunidadId: 1 };
    mockPrismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    const error = new Error('Database error');
    mockPrismaService.sectores.create.mockRejectedValue(error);

    await expect(useCase.execute(dto as any)).rejects.toThrow('Database error');
  });
});
