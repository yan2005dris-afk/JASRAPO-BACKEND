import { Test, TestingModule } from '@nestjs/testing';
import { GetEffectivePermissionsUseCase } from './get-effective-permissions.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GetEffectivePermissionsUseCase', () => {
  let useCase: GetEffectivePermissionsUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    users: {
      findUnique: jest.fn(),
    },
    rolPermissions: {
      findMany: jest.fn(),
    },
    rolesHeredados: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEffectivePermissionsUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<GetEffectivePermissionsUseCase>(GetEffectivePermissionsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should combine role and direct permissions', async () => {
    mockPrisma.users.findUnique.mockResolvedValue({
      usersId: 1,
      deletedAt: null,
      role: { rolesId: 1, deletedAt: null },
      userPermissions: [
        {
          allow: true,
          Permissions: { resource: 'extra', action: 'read', deletedAt: null },
        },
      ],
    });
    mockPrisma.rolesHeredados.findMany.mockResolvedValue([]);
    mockPrisma.rolPermissions.findMany.mockResolvedValue([
      { permissions: { resource: 'role-perm', action: 'read' } },
    ]);

    const result = await useCase.execute(1);

    expect(result).toContainEqual({ resource: 'role-perm', action: 'read' });
    expect(result).toContainEqual({ resource: 'extra', action: 'read' });
  });

  it('should exclude revoked permissions', async () => {
    mockPrisma.users.findUnique.mockResolvedValue({
      usersId: 1,
      deletedAt: null,
      role: { rolesId: 1, deletedAt: null },
      userPermissions: [
        {
          allow: false,
          Permissions: { resource: 'role-perm', action: 'read', deletedAt: null },
        },
      ],
    });
    mockPrisma.rolesHeredados.findMany.mockResolvedValue([]);
    mockPrisma.rolPermissions.findMany.mockResolvedValue([
      { permissions: { resource: 'role-perm', action: 'read' } },
    ]);

    const result = await useCase.execute(1);

    expect(result).not.toContainEqual({ resource: 'role-perm', action: 'read' });
  });

  it('should throw NotFoundException if user not found or deleted', async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
