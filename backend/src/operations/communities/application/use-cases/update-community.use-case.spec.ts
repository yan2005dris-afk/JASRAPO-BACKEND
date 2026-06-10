import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateCommunityUseCase } from './update-community.use-case';

describe('UpdateCommunityUseCase', () => {
  let useCase: UpdateCommunityUseCase;
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
        UpdateCommunityUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<UpdateCommunityUseCase>(UpdateCommunityUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should update a community', async () => {
    const id = 1;
    const dto = { nombre: 'Comunidad Updated' };
    mockPrismaService.comunidades.findUnique.mockResolvedValue({
      comunidadId: id,
      nombre: 'Old Name',
      deletedAt: null,
    });
    mockPrismaService.comunidades.update.mockResolvedValue({
      comunidadId: id,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await useCase.execute(id, dto);

    expect(result).toBeDefined();
    expect(prisma.comunidades.update).toHaveBeenCalled();
  });
});
