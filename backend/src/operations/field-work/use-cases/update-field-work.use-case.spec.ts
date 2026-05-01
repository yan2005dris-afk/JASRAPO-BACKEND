import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateFieldWorkUseCase } from './update-field-work.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NovedadOperativaEntity } from '../entities/novedad-operativa.entity';
import { NotFoundException } from '@nestjs/common';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/enums';

describe('UpdateFieldWorkUseCase', () => {
  let useCase: UpdateFieldWorkUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    novedadOperativa: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateFieldWorkUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateFieldWorkUseCase>(UpdateFieldWorkUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a field work successfully', async () => {
    const id = BigInt(1);
    const dto = { observacion: 'Updated observation' };
    const mockExisting = {
      novedadId: id,
      lecturaId: BigInt(1),
      observacion: 'Old observation',
      tipo: TipoNovedad.FUGA,
      estado: EstadoNovedad.PENDIENTE,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const mockUpdated = { ...mockExisting, ...dto };

    mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(
      mockExisting,
    );
    mockPrismaService.novedadOperativa.update.mockResolvedValue(mockUpdated);

    const result = await useCase.execute(id, dto);

    expect(result).toBeInstanceOf(NovedadOperativaEntity);
    expect(result.observacion).toBe(dto.observacion);
    expect(mockPrismaService.novedadOperativa.update).toHaveBeenCalledWith({
      where: { novedadId: id },
      data: dto,
    });
  });

  it('should throw NotFoundException if not found', async () => {
    mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(BigInt(1), {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should handle BigInt conversion for lecturaId', async () => {
    const id = BigInt(1);
    const dto = { lecturaId: '2' };
    mockPrismaService.novedadOperativa.findUnique.mockResolvedValue({
      novedadId: id,
      deletedAt: null,
    });
    mockPrismaService.novedadOperativa.update.mockResolvedValue({
      novedadId: id,
      lecturaId: BigInt(2),
    });

    await useCase.execute(id, dto);

    expect(mockPrismaService.novedadOperativa.update).toHaveBeenCalledWith({
      where: { novedadId: id },
      data: { lecturaId: BigInt(2) },
    });
  });
});
