import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllPermissionsUseCase } from './find-all-permissions.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FindAllPermissionsUseCase', () => {
  let useCase: FindAllPermissionsUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    permissions: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllPermissionsUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<FindAllPermissionsUseCase>(FindAllPermissionsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return all permissions', async () => {
    mockPrisma.permissions.findMany.mockResolvedValue([
      { permissionsId: 1, resource: 'Users', action: 'Read' },
    ]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(prisma.permissions.findMany).toHaveBeenCalled();
  });
});
