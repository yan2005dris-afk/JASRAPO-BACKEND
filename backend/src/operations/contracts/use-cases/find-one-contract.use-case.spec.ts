import { Test, TestingModule } from '@nestjs/testing';
import { FindOneContractUseCase } from './find-one-contract.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FindOneContractUseCase', () => {
  let useCase: FindOneContractUseCase;

  const mockPrismaService = {
    contratos: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneContractUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<FindOneContractUseCase>(FindOneContractUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a contract if it exists and is not deleted', async () => {
    const id = BigInt(1);
    const mockContract = { contratoId: id, deletedAt: null };
    mockPrismaService.contratos.findUnique.mockResolvedValue(mockContract);

    const result = await useCase.execute(id);

    expect(result).toEqual(mockContract);
    expect(mockPrismaService.contratos.findUnique).toHaveBeenCalledWith({
      where: { contratoId: id },
    });
  });

  it('should throw NotFoundException if contract does not exist', async () => {
    const id = BigInt(1);
    mockPrismaService.contratos.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if contract is deleted', async () => {
    const id = BigInt(1);
    mockPrismaService.contratos.findUnique.mockResolvedValue({ contratoId: id, deletedAt: new Date() });

    await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
  });
});
