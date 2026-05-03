import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateCommunityUseCase } from './create-community.use-case';

describe('CreateCommunityUseCase', () => {
  let useCase: CreateCommunityUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    comunidades: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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

    // Default mocks to avoid crashes
    mockPrismaService.comunidades.findFirst.mockResolvedValue(null);
    mockPrismaService.comunidades.findUnique.mockResolvedValue(null);
  });

  it('should create a community', async () => {
    const dto = {
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 5,
    };
    mockPrismaService.comunidades.create.mockResolvedValue({
      comunidadId: 1,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(prisma.comunidades.create).toHaveBeenCalled();
  });
});
