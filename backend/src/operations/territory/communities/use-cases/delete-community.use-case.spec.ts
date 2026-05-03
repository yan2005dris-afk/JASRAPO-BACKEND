import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { DeleteCommunityUseCase } from './delete-community.use-case';

describe('DeleteCommunityUseCase', () => {
  let useCase: DeleteCommunityUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    comunidades: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCommunityUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<DeleteCommunityUseCase>(DeleteCommunityUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should delete a community', async () => {
    const id = 1;
    mockPrismaService.comunidades.findUnique.mockResolvedValue({
      comunidadId: id,
      deletedAt: null,
    });
    mockPrismaService.comunidades.update.mockResolvedValue({
      comunidadId: id,
      deletedAt: new Date(),
    });

    const result = await useCase.execute(id);

    expect(result).toBeDefined();
    expect(prisma.comunidades.update).toHaveBeenCalled();
  });
});
