import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateContractUseCase } from './update-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';

describe('UpdateContractUseCase', () => {
  let useCase: UpdateContractUseCase;
  let mockTx: any;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    executeTransaction: jest.fn(),
  };

  beforeEach(async () => {
    mockTx = {
      contratos: { update: jest.fn() },
      medidores: { findUnique: jest.fn() },
      historialMedidores: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    mockContractRepository.executeTransaction.mockImplementation((cb: any) =>
      cb(mockTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateContractUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateContractUseCase>(UpdateContractUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update contract estado only (S2.1)', async () => {
    const id = BigInt(1);
    const updateDto = { estado: 'ACTIVO' };

    // First call for existence check, second for return value after update
    mockContractRepository.findUnique
      .mockResolvedValueOnce({ contratoId: id, deletedAt: null })
      .mockResolvedValueOnce({
        contratoId: id,
        estado: 'ACTIVO',
        deletedAt: null,
      });
    mockContractRepository.update.mockResolvedValue({
      contratoId: id,
      estado: 'ACTIVO',
    });

    const result = await useCase.execute(id, updateDto);

    expect(mockContractRepository.update).toHaveBeenCalledWith(
      { contratoId: id },
      { estado: 'ACTIVO' },
    );
    expect(result).toMatchObject({ contratoId: id, estado: 'ACTIVO' });
  });

  it('should replace contract meter (S2.2)', async () => {
    const id = BigInt(1);
    const updateDto = { medidorId: '2', lecturaInicial: 150 };

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: null,
    });
    mockTx.medidores.findUnique.mockResolvedValue({ medidorId: BigInt(2) });
    mockTx.historialMedidores.updateMany.mockResolvedValue({ count: 1 });
    mockTx.historialMedidores.create.mockResolvedValue({});
    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      estado: 'SOLICITUD',
    });

    const result = await useCase.execute(id, updateDto);

    expect(mockTx.historialMedidores.updateMany).toHaveBeenCalledWith({
      where: { contratoId: id, fechaHasta: null },
      data: { fechaHasta: expect.any(Date) },
    });
    expect(mockTx.historialMedidores.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        medidorId: BigInt(2),
        contratoId: id,
        motivo: 'REEMPLAZO',
      }),
    });
    expect(result).toBeDefined();
  });

  it('should replace meter when no active link exists (S2.3)', async () => {
    const id = BigInt(1);
    const updateDto = { medidorId: '3' };

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: null,
    });
    mockTx.medidores.findUnique.mockResolvedValue({ medidorId: BigInt(3) });
    mockTx.historialMedidores.updateMany.mockResolvedValue({ count: 0 });
    mockTx.historialMedidores.create.mockResolvedValue({});
    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
    });

    const result = await useCase.execute(id, updateDto);

    // updateMany should still be called even if no active link (harmless)
    expect(mockTx.historialMedidores.updateMany).toHaveBeenCalledWith({
      where: { contratoId: id, fechaHasta: null },
      data: { fechaHasta: expect.any(Date) },
    });
    // New link should be created regardless
    expect(mockTx.historialMedidores.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException if contract does not exist (S2.4)', async () => {
    const id = BigInt(999);
    mockContractRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id, { estado: 'ACTIVO' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if contract is soft-deleted (S2.5)', async () => {
    const id = BigInt(1);
    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(id, { estado: 'ACTIVO' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when medidorId does not exist (S2.6)', async () => {
    const id = BigInt(1);
    const updateDto = { medidorId: '999' };

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: null,
    });
    mockTx.medidores.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id, updateDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException when updateData is empty (S2.7)', async () => {
    const id = BigInt(1);
    const updateDto = {};

    mockContractRepository.findUnique.mockResolvedValueOnce({
      contratoId: id,
      deletedAt: null,
    });

    await expect(useCase.execute(id, updateDto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
