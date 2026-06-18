import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateContractUseCase } from './update-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';

describe('UpdateContractUseCase', () => {
  let useCase: UpdateContractUseCase;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    replaceMeterInContract: jest.fn(),
  };

  beforeEach(async () => {
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
    mockContractRepository.replaceMeterInContract.mockResolvedValue({
      contratoId: id,
      estado: 'SOLICITUD',
    } as any);

    const result = await useCase.execute(id, updateDto);

    expect(mockContractRepository.replaceMeterInContract).toHaveBeenCalledWith(
      id,
      BigInt(2),
      150,
      undefined,
    );
    expect(result).toBeDefined();
  });

  it('should replace meter with contract field updates (S2.3)', async () => {
    const id = BigInt(1);
    const updateDto = {
      medidorId: '3',
      estado: 'ACTIVO',
      direccionSuministro: 'Nueva Dir',
    };

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: null,
    });
    mockContractRepository.replaceMeterInContract.mockResolvedValue({
      contratoId: id,
      estado: 'ACTIVO',
    } as any);

    const result = await useCase.execute(id, updateDto);

    expect(mockContractRepository.replaceMeterInContract).toHaveBeenCalledWith(
      id,
      BigInt(3),
      0,
      { estado: 'ACTIVO', direccionSuministro: 'Nueva Dir' },
    );
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
    mockContractRepository.replaceMeterInContract.mockRejectedValue(
      new NotFoundException(`Medidor con ID 999 no encontrado`),
    );

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
