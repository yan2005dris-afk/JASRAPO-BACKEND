import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateContractLinkUseCase } from './create-contract-link.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('CreateContractLinkUseCase', () => {
  let useCase: CreateContractLinkUseCase;

  const mockPrismaService = {
    medidores: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    historialMedidores: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateContractLinkUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateContractLinkUseCase>(CreateContractLinkUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a new link and close previous ones', async () => {
    const dto = { medidorId: '1', contratoId: '2', lecturaInicial: 0 };
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      medidorId: BigInt(1),
    });
    mockPrismaService.historialMedidores.updateMany.mockResolvedValue({
      count: 1,
    });
    mockPrismaService.historialMedidores.create.mockResolvedValue({});

    await useCase.execute(dto);

    // Should close existing links for either medidor or contract
    expect(
      mockPrismaService.historialMedidores.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        OR: [
          { medidorId: BigInt(1), fechaHasta: null },
          { contratoId: BigInt(2), fechaHasta: null },
        ],
      },
      data: { fechaHasta: expect.any(Date) },
    });

    // Should create new link
    expect(mockPrismaService.historialMedidores.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        medidorId: BigInt(1),
        contratoId: BigInt(2),
        lecturaInicial: 0,
      }),
    });
  });
});
