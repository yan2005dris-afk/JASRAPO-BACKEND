import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateTariffCategoryUseCase } from './update-tariff-category.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UpdateTariffCategoryUseCase', () => {
  let useCase: UpdateTariffCategoryUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    categoriaTarifa: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTariffCategoryUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTariffCategoryUseCase>(
      UpdateTariffCategoryUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a tariff category using a transaction', async () => {
    const id = 1;
    const dto = { nombre: 'Residencial Plus' };
    const current = {
      categoriaTarifaId: id,
      nombre: 'Residencial',
      activo: true,
    };

    mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(current);
    mockPrismaService.$transaction.mockImplementation(async (cb) => {
      const tx = {
        categoriaTarifa: {
          update: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue(null), // No existe duplicado
          create: jest
            .fn()
            .mockResolvedValue({ categoriaTarifaId: 2, ...dto, activo: true }),
        },
      };
      return cb(tx);
    });

    const result = await useCase.execute(id, dto);

    expect(result).toBeDefined();
    expect(mockPrismaService.categoriaTarifa.findFirst).toHaveBeenCalled();
    expect(result.nombre).toBe('Residencial Plus');
  });

  it('should throw NotFoundException if category does not exist', async () => {
    mockPrismaService.categoriaTarifa.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(1, { nombre: 'New' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ConflictException if new name already exists', async () => {
    const id = 1;
    const dto = { nombre: 'Comercial' };
    const current = {
      categoriaTarifaId: id,
      nombre: 'Residencial',
      activo: true,
    };

    mockPrismaService.categoriaTarifa.findFirst.mockImplementation((args) => {
      if (args.where.nombre === 'Comercial')
        return { categoriaTarifaId: 2, nombre: 'Comercial' };
      return current;
    });
    mockPrismaService.$transaction.mockImplementation(async (cb) => {
      const tx = {
        categoriaTarifa: {
          update: jest.fn(),
          findFirst: jest
            .fn()
            .mockResolvedValue({ categoriaTarifaId: 2, nombre: 'Comercial' }),
          create: jest.fn(),
        },
      };
      return cb(tx);
    });

    await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
  });
});
