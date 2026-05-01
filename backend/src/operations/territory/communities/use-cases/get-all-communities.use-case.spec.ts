import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { GetAllCommunitiesUseCase } from './get-all-communities.use-case';

describe('GetAllCommunitiesUseCase', () => {
  let useCase: GetAllCommunitiesUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    comunidades: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCommunitiesUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<GetAllCommunitiesUseCase>(GetAllCommunitiesUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return all communities', async () => {
    const communities = [{ comunidadId: 1, nombre: 'Comunidad 1' }];
    mockPrismaService.comunidades.findMany.mockResolvedValue(communities);

    const result = await useCase.execute();

    expect(result).toEqual(communities);
    expect(prisma.comunidades.findMany).toHaveBeenCalled();
  });
});
