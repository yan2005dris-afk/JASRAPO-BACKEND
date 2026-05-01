import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetRoleChildrenUseCase } from './get-role-children.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GetRoleChildrenUseCase', () => {
  let useCase: GetRoleChildrenUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    roles: {
      findUnique: jest.fn(),
    },
    rolesHeredados: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRoleChildrenUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<GetRoleChildrenUseCase>(GetRoleChildrenUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should return children for a role', async () => {
    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId: 1 });
    mockPrisma.rolesHeredados.findMany.mockResolvedValue([
      {
        roleHierarchyId: 1,
        childRoleId: 2,
        childRole: { name: 'Child Role' },
      },
    ]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      roleHierarchyId: 1,
      childRoleId: 2,
      childRoleName: 'Child Role',
    });
  });

  it('should throw NotFoundException if role does not exist', async () => {
    mockPrisma.roles.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
