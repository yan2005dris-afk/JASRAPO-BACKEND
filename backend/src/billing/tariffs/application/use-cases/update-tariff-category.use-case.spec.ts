import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateTariffCategoryUseCase } from './update-tariff-category.use-case';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UpdateTariffCategoryUseCase', () => {
  let useCase: UpdateTariffCategoryUseCase;

  const mockTariffRepository = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTariffCategoryUseCase,
        {
          provide: TariffRepository,
          useValue: mockTariffRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTariffCategoryUseCase>(
      UpdateTariffCategoryUseCase,
    );
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

    mockTariffRepository.findFirst.mockResolvedValue(current);
    mockTariffRepository.executeTransaction.mockImplementation(async (cb) => {
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
    expect(mockTariffRepository.findFirst).toHaveBeenCalled();
    expect(result.nombre).toBe('Residencial Plus');
  });

  it('should throw NotFoundException if category does not exist', async () => {
    mockTariffRepository.findFirst.mockResolvedValue(null);

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

    mockTariffRepository.findFirst.mockImplementation((args: any) => {
      if (args.nombre === 'Comercial')
        return { categoriaTarifaId: 2, nombre: 'Comercial' };
      return current;
    });
    mockTariffRepository.executeTransaction.mockImplementation(async (cb) => {
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
