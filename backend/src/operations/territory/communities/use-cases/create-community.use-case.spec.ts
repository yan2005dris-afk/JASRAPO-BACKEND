import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateCommunityUseCase } from './create-community.use-case';

describe('CreateCommunityUseCase', () => {
  let useCase: CreateCommunityUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    comunidades: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommunityUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<CreateCommunityUseCase>(CreateCommunityUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a community', async () => {
    const dto = { nombre: 'Comunidad Test', sectorId: 1 };
    mockPrismaService.comunidades.create.mockResolvedValue({ comunidadId: 1, ...dto });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ comunidadId: 1, ...dto });
    expect(prisma.comunidades.create).toHaveBeenCalledWith({ data: dto });
  });
});
