import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveContractUseCase } from './remove-contract.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RemoveContractUseCase', () => {
  let useCase: RemoveContractUseCase;

  const mockPrismaService = {
    contratos: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveContractUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<RemoveContractUseCase>(RemoveContractUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete a contract if it exists', async () => {
    const id = BigInt(1);
    mockPrismaService.contratos.findUnique.mockResolvedValue({
      contratoId: id,
      deletedAt: null,
    });
    mockPrismaService.contratos.update.mockResolvedValue({
      contratoId: id,
      deletedAt: new Date(),
    });

    const result = await useCase.execute(id);

    expect(result.message).toContain(`Contrato con ID ${id} eliminado`);
    expect(mockPrismaService.contratos.update).toHaveBeenCalledWith({
      where: { contratoId: id },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw NotFoundException if contract does not exist', async () => {
    const id = BigInt(1);
    mockPrismaService.contratos.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
  });
});
