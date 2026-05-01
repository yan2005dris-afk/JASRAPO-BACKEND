import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { GetCommunityUseCase } from './get-community.use-case';
import { NotFoundException } from '@nestjs/common';

describe('GetCommunityUseCase', () => {
  let useCase: GetCommunityUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    comunidades: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCommunityUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<GetCommunityUseCase>(GetCommunityUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return a community if found', async () => {
    const id = 1;
    const community = { comunidadId: id, nombre: 'Comunidad 1' };
    mockPrismaService.comunidades.findUnique.mockResolvedValue(community);

    const result = await useCase.execute(id);

    expect(result).toEqual(community);
    expect(prisma.comunidades.findUnique).toHaveBeenCalledWith({
      where: { comunidadId: id },
    });
  });

  it('should throw NotFoundException if community not found', async () => {
    const id = 1;
    mockPrismaService.comunidades.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
  });
});
