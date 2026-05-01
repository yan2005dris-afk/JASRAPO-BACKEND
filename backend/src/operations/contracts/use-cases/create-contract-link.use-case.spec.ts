import { Test, TestingModule } from '@nestjs/testing';
import { CreateContractLinkUseCase } from './create-contract-link.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('CreateContractLinkUseCase', () => {
  let useCase: CreateContractLinkUseCase;

  const mockPrismaService = {
    medidores: {
      update: jest.fn(),
    },
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

  it('should update medidor with contratoId', async () => {
    const dto = { medidorId: '1', contratoId: '2' };
    mockPrismaService.medidores.update.mockResolvedValue({ medidorId: BigInt(1), contratoId: BigInt(2) });

    const result = await useCase.execute(dto);

    expect(result.contratoId).toBe(BigInt(2));
    expect(mockPrismaService.medidores.update).toHaveBeenCalledWith({
      where: { medidorId: BigInt(1) },
      data: { contratoId: BigInt(2) },
    });
  });
});
