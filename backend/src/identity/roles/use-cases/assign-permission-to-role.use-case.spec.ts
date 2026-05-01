import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AssignPermissionToRoleUseCase } from './assign-permission-to-role.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('AssignPermissionToRoleUseCase', () => {
  let useCase: AssignPermissionToRoleUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    roles: {
      findUnique: jest.fn(),
    },
    permissions: {
      findUnique: jest.fn(),
    },
    rolPermissions: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignPermissionToRoleUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<AssignPermissionToRoleUseCase>(
      AssignPermissionToRoleUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should assign a permission to a role', async () => {
    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId: 1 });
    mockPrisma.permissions.findUnique.mockResolvedValue({ permissionsId: 10 });
    mockPrisma.rolPermissions.findFirst.mockResolvedValue(null);
    mockPrisma.rolPermissions.create.mockResolvedValue({
      rolPermissionsId: 100,
    });

    const result = await useCase.execute(1, 10);

    expect(result).toEqual({ rolPermissionsId: 100 });
    expect(prisma.rolPermissions.create).toHaveBeenCalledWith({
      data: { rolesId: 1, permissionsId: 10 },
    });
  });

  it('should throw ConflictException if already assigned', async () => {
    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId: 1 });
    mockPrisma.permissions.findUnique.mockResolvedValue({ permissionsId: 10 });
    mockPrisma.rolPermissions.findFirst.mockResolvedValue({
      rolPermissionsId: 100,
      deletedAt: null,
    });

    await expect(useCase.execute(1, 10)).rejects.toThrow(ConflictException);
  });

  it('should restore if previously deleted', async () => {
    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId: 1 });
    mockPrisma.permissions.findUnique.mockResolvedValue({ permissionsId: 10 });
    mockPrisma.rolPermissions.findFirst.mockResolvedValue({
      rolPermissionsId: 100,
      deletedAt: new Date(),
    });
    mockPrisma.rolPermissions.update.mockResolvedValue({
      rolPermissionsId: 100,
      deletedAt: null,
    });

    const result = await useCase.execute(1, 10);

    expect(result.deletedAt).toBeNull();
    expect(prisma.rolPermissions.update).toHaveBeenCalled();
  });
});
