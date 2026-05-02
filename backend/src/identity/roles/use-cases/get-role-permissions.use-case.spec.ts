import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetRolePermissionsUseCase } from './get-role-permissions.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GetRolePermissionsUseCase', () => {
  let useCase: GetRolePermissionsUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    roles: {
      findUnique: jest.fn(),
    },
    rolPermissions: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRolePermissionsUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<GetRolePermissionsUseCase>(GetRolePermissionsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should return permissions for a role (flat model)', async () => {
    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId: 1 });
    mockPrisma.rolPermissions.findMany.mockResolvedValue([
      {
        rolPermissionsId: 1,
        permissionsId: 10,
        permissions: { permissionsId: 10, resource: 'Users', action: 'Read' },
      },
      {
        rolPermissionsId: 2,
        permissionsId: 11,
        permissions: { permissionsId: 11, resource: 'Users', action: 'Write' },
      },
    ]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      rolPermissionsId: 1,
      permissionsId: 10,
      resource: 'Users',
      action: 'Read',
    });
    expect(prisma.roles.findUnique).toHaveBeenCalled();
  });

  it('should throw NotFoundException if role does not exist', async () => {
    mockPrisma.roles.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
