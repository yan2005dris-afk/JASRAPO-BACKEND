import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateContractUseCase } from './update-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateContractUseCase', () => {
  let useCase: UpdateContractUseCase;

  const mockContractRepository = {
    findById: jest.fn(),
    update: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update contract estado only', async () => {
    const id = BigInt(1);
    const updateDto = { estado: 'ACTIVO' };

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({ contratoId: id, deletedAt: null }),
    );
    mockContractRepository.update.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        estado: 'ACTIVO',
      }),
    );

    const result = await useCase.execute(id, updateDto);

    expect(mockContractRepository.update).toHaveBeenCalledWith(id, {
      estado: 'ACTIVO',
    });
    expect(result).toMatchObject({ contratoId: id, estado: 'ACTIVO' });
  });

  it('should replace contract meter', async () => {
    const id = BigInt(1);
    const updateDto = { medidorId: '2', lecturaInicial: 150 };

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        deletedAt: null,
      }),
    );
    mockContractRepository.replaceMeterInContract.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        estado: 'SOLICITUD',
      }),
    );

    const result = await useCase.execute(id, updateDto);

    expect(mockContractRepository.replaceMeterInContract).toHaveBeenCalledWith(
      id,
      BigInt(2),
      150,
      undefined,
    );
    expect(result).toBeDefined();
  });

  it('should replace meter with contract field updates', async () => {
    const id = BigInt(1);
    const updateDto = {
      medidorId: '3',
      estado: 'ACTIVO',
      direccionSuministro: 'Nueva Dir',
    };

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        deletedAt: null,
      }),
    );
    mockContractRepository.replaceMeterInContract.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        estado: 'ACTIVO',
      }),
    );

    const result = await useCase.execute(id, updateDto);

    expect(mockContractRepository.replaceMeterInContract).toHaveBeenCalledWith(
      id,
      BigInt(3),
      0,
      { estado: 'ACTIVO', direccionSuministro: 'Nueva Dir' },
    );
    expect(result).toBeDefined();
  });

  it('should throw EntityNotFoundException if contract does not exist', async () => {
    const id = BigInt(999);
    mockContractRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(id, { estado: 'ACTIVO' })).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw InvalidDomainOperationException when updateData is empty', async () => {
    const id = BigInt(1);
    const updateDto = {};

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        deletedAt: null,
      }),
    );

    await expect(useCase.execute(id, updateDto)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });
});
