import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FinalizeMeterLinkUseCase } from './finalize-meter-link.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';

describe('FinalizeMeterLinkUseCase', () => {
  let useCase: FinalizeMeterLinkUseCase;
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
      medidores: { findUnique: jest.fn() },
      historialMedidores: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    mockContractRepository.executeTransaction.mockImplementation((cb: any) =>
      cb(mockTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinalizeMeterLinkUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<FinalizeMeterLinkUseCase>(FinalizeMeterLinkUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should finalize active link by contratoId (S3.1)', async () => {
    const contratoId = BigInt(1);
    const activeLink = {
      historialId: BigInt(100),
      medidorId: BigInt(200),
      contratoId,
      fechaHasta: null,
    };

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId,
      deletedAt: null,
    });
    mockTx.historialMedidores.findFirst.mockResolvedValue(activeLink);
    mockTx.historialMedidores.update.mockResolvedValue({
      ...activeLink,
      fechaHasta: new Date(),
    });
    mockTx.medidores.findUnique.mockResolvedValue({
      medidorId: BigInt(200),
      serie: 'SER-12345',
    });

    const result = await useCase.execute(contratoId);

    expect(mockContractRepository.findUnique).toHaveBeenCalledWith({
      contratoId,
    });
    expect(mockTx.historialMedidores.findFirst).toHaveBeenCalledWith({
      where: { contratoId, fechaHasta: null },
    });
    expect(mockTx.historialMedidores.update).toHaveBeenCalledWith({
      where: { historialId: BigInt(100) },
      data: { fechaHasta: expect.any(Date) },
    });
    expect(result).toEqual({ medidorId: BigInt(200), serie: 'SER-12345' });
  });

  it('should throw NotFoundException when no active link exists (S3.2)', async () => {
    const contratoId = BigInt(1);

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId,
      deletedAt: null,
    });
    mockTx.historialMedidores.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when contract does not exist (S3.3)', async () => {
    const contratoId = BigInt(999);

    mockContractRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when contract is soft-deleted (S3.4)', async () => {
    const contratoId = BigInt(1);

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when medidor not found after finalizing (S3.5)', async () => {
    const contratoId = BigInt(1);
    const activeLink = {
      historialId: BigInt(100),
      medidorId: BigInt(999),
      contratoId,
      fechaHasta: null,
    };

    mockContractRepository.findUnique.mockResolvedValue({
      contratoId,
      deletedAt: null,
    });
    mockTx.historialMedidores.findFirst.mockResolvedValue(activeLink);
    mockTx.historialMedidores.update.mockResolvedValue({
      ...activeLink,
      fechaHasta: new Date(),
    });
    mockTx.medidores.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(contratoId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
