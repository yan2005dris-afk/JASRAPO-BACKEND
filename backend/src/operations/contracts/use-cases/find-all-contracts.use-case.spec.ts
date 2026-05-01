import { Test, TestingModule } from '@nestjs/testing';
import { FindAllContractsUseCase } from './find-all-contracts.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FindAllContractsUseCase', () => {
  let useCase: FindAllContractsUseCase;

  const mockPrismaService = {
    contratos: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllContractsUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<FindAllContractsUseCase>(FindAllContractsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call findMany with correct parameters', async () => {
    const params = { skip: 0, take: 10 };
    mockPrismaService.contratos.findMany.mockResolvedValue([]);

    const result = await useCase.execute(params);

    expect(result).toEqual([]);
    expect(mockPrismaService.contratos.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });
});
