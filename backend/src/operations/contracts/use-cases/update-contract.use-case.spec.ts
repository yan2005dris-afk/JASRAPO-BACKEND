import { Test, TestingModule } from '@nestjs/testing';
import { UpdateContractUseCase } from './update-contract.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UpdateContractUseCase', () => {
  let useCase: UpdateContractUseCase;

  const mockPrismaService = {
    contratos: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateContractUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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

  it('should update a contract if it exists', async () => {
    const id = BigInt(1);
    const updateDto = { numeroGuia: 'NEW-GUIA' };
    mockPrismaService.contratos.findUnique.mockResolvedValue({ contratoId: id, deletedAt: null });
    mockPrismaService.contratos.update.mockResolvedValue({ contratoId: id, ...updateDto });

    const result = await useCase.execute(id, updateDto);

    expect(result.numeroGuia).toBe('NEW-GUIA');
    expect(mockPrismaService.contratos.update).toHaveBeenCalledWith({
      where: { contratoId: id },
      data: updateDto,
    });
  });

  it('should throw NotFoundException if contract does not exist', async () => {
    const id = BigInt(1);
    mockPrismaService.contratos.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id, { numeroGuia: 'TEST' })).rejects.toThrow(NotFoundException);
  });
});
