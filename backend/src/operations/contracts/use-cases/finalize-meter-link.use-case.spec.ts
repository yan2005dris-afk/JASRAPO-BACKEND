import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FinalizeMeterLinkUseCase } from './finalize-meter-link.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FinalizeMeterLinkUseCase', () => {
  let useCase: FinalizeMeterLinkUseCase;

  const mockPrismaService = {
    medidores: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    historialMedidores: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinalizeMeterLinkUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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

  it('should finalize link and close history', async () => {
    const medidorId = BigInt(1);
    mockPrismaService.medidores.findUnique.mockResolvedValue({
      medidorId,
    });
    mockPrismaService.historialMedidores.updateMany.mockResolvedValue({ count: 1 });

    const result = await useCase.execute(medidorId);

    expect(result).toBeDefined();
    
    // Should close existing history for the medidor
    expect(mockPrismaService.historialMedidores.updateMany).toHaveBeenCalledWith({
      where: { medidorId, fechaHasta: null },
      data: { fechaHasta: expect.any(Date) },
    });
  });
});
