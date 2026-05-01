import { Test, TestingModule } from '@nestjs/testing';
import { AssignPermissionToUserUseCase } from './assign-permission-to-user.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AssignPermissionToUserUseCase', () => {
  let useCase: AssignPermissionToUserUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    users: {
      findUnique: jest.fn(),
    },
    permissions: {
      findUnique: jest.fn(),
    },
    userPermissions: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignPermissionToUserUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<AssignPermissionToUserUseCase>(AssignPermissionToUserUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create new permission assignment if not exists', async () => {
    mockPrisma.users.findUnique.mockResolvedValue({ usersId: 1, deletedAt: null });
    mockPrisma.permissions.findUnique.mockResolvedValue({ permissionsId: 2, deletedAt: null });
    mockPrisma.userPermissions.findFirst.mockResolvedValue(null);
    mockPrisma.userPermissions.create.mockResolvedValue({ idUserPermissions: 10 });

    const result = await useCase.execute(1, 2, true);

    expect(result.idUserPermissions).toBe(10);
    expect(mockPrisma.userPermissions.create).toHaveBeenCalledWith({
      data: { usersId: 1, permissionsId: 2, allow: true },
    });
  });

  it('should update existing permission assignment', async () => {
    mockPrisma.users.findUnique.mockResolvedValue({ usersId: 1, deletedAt: null });
    mockPrisma.permissions.findUnique.mockResolvedValue({ permissionsId: 2, deletedAt: null });
    mockPrisma.userPermissions.findFirst.mockResolvedValue({ idUserPermissions: 10, allow: false });
    mockPrisma.userPermissions.update.mockResolvedValue({ idUserPermissions: 10, allow: true });

    const result = await useCase.execute(1, 2, true);

    expect(result.allow).toBe(true);
    expect(mockPrisma.userPermissions.update).toHaveBeenCalledWith({
      where: { idUserPermissions: 10 },
      data: { allow: true },
    });
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1, 2)).rejects.toThrow(NotFoundException);
  });
});
