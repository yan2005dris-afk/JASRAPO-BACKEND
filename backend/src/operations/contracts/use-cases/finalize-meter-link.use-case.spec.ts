import { Test, TestingModule } from '@nestjs/testing';
import { FinalizeMeterLinkUseCase } from './finalize-meter-link.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FinalizeMeterLinkUseCase', () => {
  let useCase: FinalizeMeterLinkUseCase;

  const mockPrismaService = {
    medidores: {
      update: jest.fn(),
    },
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

  it('should update medidor to set contratoId to null', async () => {
    const medidorId = BigInt(1);
    mockPrismaService.medidores.update.mockResolvedValue({ medidorId, contratoId: null });

    const result = await useCase.execute(medidorId);

    expect(result.contratoId).toBeNull();
    expect(mockPrismaService.medidores.update).toHaveBeenCalledWith({
      where: { medidorId },
      data: { contratoId: null },
    });
  });
});
