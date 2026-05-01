import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SetRoleChildrenUseCase } from './set-role-children.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SetRoleChildrenUseCase', () => {
  let useCase: SetRoleChildrenUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    roles: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    rolesHeredados: {
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetRoleChildrenUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<SetRoleChildrenUseCase>(SetRoleChildrenUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should set children for a role', async () => {
    const rolesId = 1;
    const dto = { childRoleIds: [2, 3] };

    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId });
    mockPrisma.roles.findMany.mockResolvedValue([
      { rolesId: 2 },
      { rolesId: 3 },
    ]);
    mockPrisma.rolesHeredados.findFirst.mockResolvedValue(null);
    mockPrisma.rolesHeredados.findMany.mockResolvedValue([
      { roleHierarchyId: 1, childRoleId: 2, childRole: { name: 'Role 2' } },
      { roleHierarchyId: 2, childRoleId: 3, childRole: { name: 'Role 3' } },
    ]);

    const result = await useCase.execute(rolesId, dto);

    expect(result).toHaveLength(2);
    expect(prisma.rolesHeredados.create).toHaveBeenCalledTimes(2);
    expect(prisma.rolesHeredados.updateMany).toHaveBeenCalled();
  });

  it('should throw NotFoundException if children do not exist', async () => {
    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId: 1 });
    mockPrisma.roles.findMany.mockResolvedValue([{ rolesId: 2 }]);

    await expect(useCase.execute(1, { childRoleIds: [2, 3] })).rejects.toThrow(
      NotFoundException,
    );
  });
});
