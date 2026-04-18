import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockUser = {
    usersId: BigInt(1),
    email: 'test@test.com',
    password: '$2a$10$hashedpassword',
    rolesId: 1,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole = {
    rolesId: 1,
    name: 'user',
    deletedAt: null,
  };

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    roles: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    profiles: {
      create: jest.fn(),
    },
    userPermissions: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    permissions: {
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
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create user with default user role', async () => {
      mockPrismaService.roles.findFirst.mockResolvedValue(mockRole);
      mockPrismaService.users.create.mockResolvedValue({
        usersId: BigInt(1),
        email: 'test@test.com',
      });
      mockPrismaService.profiles.create.mockResolvedValue({});

      const result = await service.createUser({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.email).toBe('test@test.com');
      expect(mockPrismaService.users.create).toHaveBeenCalled();
      expect(mockPrismaService.profiles.create).toHaveBeenCalled();
    });

    it('should hash password if not already hashed', async () => {
      mockPrismaService.roles.findFirst.mockResolvedValue(mockRole);
      mockPrismaService.users.create.mockResolvedValue({
        usersId: BigInt(1),
        email: 'test@test.com',
      });
      mockPrismaService.profiles.create.mockResolvedValue({});

      await service.createUser({
        email: 'test@test.com',
        password: 'plainpassword',
      });

      const createCall = mockPrismaService.users.create.mock.calls[0][0];
      expect(createCall.data.password).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should not rehash already hashed password', async () => {
      const alreadyHashed = await bcrypt.hash('password123', 10);
      mockPrismaService.roles.findFirst.mockResolvedValue(mockRole);
      mockPrismaService.users.create.mockResolvedValue({
        usersId: BigInt(1),
        email: 'test@test.com',
      });
      mockPrismaService.profiles.create.mockResolvedValue({});

      await service.createUser({
        email: 'test@test.com',
        password: alreadyHashed,
      });

      const createCall = mockPrismaService.users.create.mock.calls[0][0];
      expect(createCall.data.password).toBe(alreadyHashed);
    });

    it('should throw Error when user role does not exist', async () => {
      mockPrismaService.roles.findFirst.mockResolvedValue(null);

      await expect(
        service.createUser({
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(Error);
    });

    it('should throw ConflictException on duplicate email', async () => {
      const error = new Error('Duplicate key');
      error['code'] = 'P2002';
      mockPrismaService.roles.findFirst.mockResolvedValue(mockRole);
      mockPrismaService.users.create.mockRejectedValue(error);

      await expect(
        service.createUser({
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow();
    });
  });

  describe('user', () => {
    it('should return user without password', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: BigInt(1),
        email: 'test@test.com',
      });

      const result = await service.user({ usersId: 1 });

      expect(result).toEqual({
        usersId: BigInt(1),
        email: 'test@test.com',
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      const result = await service.user({ usersId: 999 });

      expect(result).toBeNull();
    });
  });

  describe('users', () => {
    it('should return users with roles', async () => {
      mockPrismaService.users.findMany.mockResolvedValue([
        {
          ...mockUser,
          role: { rolesId: 1, name: 'user', deletedAt: null },
        },
      ]);

      const result = await service.users({});

      expect(result).toEqual([
        {
          usersId: BigInt(1),
          email: 'test@test.com',
          roles: [{ rolesId: 1, name: 'user' }],
        },
      ]);
    });

    it('should exclude deleted roles', async () => {
      mockPrismaService.users.findMany.mockResolvedValue([
        {
          ...mockUser,
          role: { rolesId: 1, name: 'user', deletedAt: new Date() },
        },
      ]);

      const result = await service.users({});

      expect(result[0].roles).toEqual([]);
    });
  });

  describe('updateUser', () => {
    it('should update user and return without password', async () => {
      mockPrismaService.users.update.mockResolvedValue({
        usersId: BigInt(1),
        email: 'new@test.com',
      });

      const result = await service.updateUser({
        where: { usersId: 1 },
        data: { email: 'new@test.com' },
      });

      expect(result.email).toBe('new@test.com');
    });

    it('should hash new password before updating', async () => {
      mockPrismaService.users.update.mockResolvedValue({
        usersId: BigInt(1),
        email: 'test@test.com',
      });

      await service.updateUser({
        where: { usersId: 1 },
        data: { password: 'newpassword' },
      });

      const updateCall = mockPrismaService.users.update.mock.calls[0][0];
      expect(updateCall.data.password).toMatch(/^\$2[aby]\$\d{2}\$/);
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete user', async () => {
      mockPrismaService.users.update.mockResolvedValue({
        usersId: BigInt(1),
        email: 'test@test.com',
      });

      const result = await service.softDeleteUser({ usersId: 1 });

      expect(result).toBeDefined();
      expect(mockPrismaService.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('getRolesByUserId', () => {
    it('should return role name for user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        role: { name: 'admin', deletedAt: null },
      });

      const result = await service.getRolesByUserId(1);

      expect(result).toBe('admin');
    });

    it('should return null for user without role', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        role: null,
      });

      const result = await service.getRolesByUserId(1);

      expect(result).toBeNull();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.getRolesByUserId(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role to user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        deletedAt: null,
      });
      mockPrismaService.roles.findUnique.mockResolvedValue({
        rolesId: 2,
        deletedAt: null,
      });
      mockPrismaService.users.update.mockResolvedValue({
        usersId: 1,
        rolesId: 2,
      });

      await service.assignRoleToUser(1, 2);

      expect(mockPrismaService.users.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.assignRoleToUser(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when user already has role', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        deletedAt: null,
        rolesId: 2,
      });
      mockPrismaService.roles.findUnique.mockResolvedValue({
        rolesId: 2,
        deletedAt: null,
      });

      await expect(service.assignRoleToUser(1, 2)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('revokeRoleFromUser', () => {
    it('should revoke role from user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        deletedAt: null,
        rolesId: 1,
      });
      mockPrismaService.users.update.mockResolvedValue({
        usersId: 1,
        rolesId: null,
      });

      await service.revokeRoleFromUser(1);

      expect(mockPrismaService.users.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.revokeRoleFromUser(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when user has no role', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        deletedAt: null,
        rolesId: null,
      });

      await expect(service.revokeRoleFromUser(1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getDirectPermissionsByUserId', () => {
    it('should return user permissions', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        deletedAt: null,
      });
      mockPrismaService.userPermissions.findMany.mockResolvedValue([
        {
          idUserPermissions: 1,
          permissionsId: 1,
          allow: true,
          Permissions: { resource: 'users', action: 'read' },
        },
      ]);

      const result = await service.getDirectPermissionsByUserId(1);

      expect(result).toEqual([
        {
          idUserPermissions: 1,
          permissionsId: 1,
          resource: 'users',
          action: 'read',
          allow: true,
        },
      ]);
    });

    it('should throw NotFoundException for deleted user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.getDirectPermissionsByUserId(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignPermissionToUser', () => {
    it('should create new permission assignment', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        deletedAt: null,
      });
      mockPrismaService.permissions.findUnique.mockResolvedValue({
        permissionsId: 1,
        deletedAt: null,
      });
      mockPrismaService.userPermissions.findFirst.mockResolvedValue(null);
      mockPrismaService.userPermissions.create.mockResolvedValue({
        idUserPermissions: 1,
      });

      await service.assignPermissionToUser(1, 1);

      expect(mockPrismaService.userPermissions.create).toHaveBeenCalled();
    });

    it('should update existing permission', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        deletedAt: null,
      });
      mockPrismaService.permissions.findUnique.mockResolvedValue({
        permissionsId: 1,
        deletedAt: null,
      });
      mockPrismaService.userPermissions.findFirst.mockResolvedValue({
        idUserPermissions: 1,
        allow: false,
      });
      mockPrismaService.userPermissions.update.mockResolvedValue({
        idUserPermissions: 1,
        allow: true,
      });

      await service.assignPermissionToUser(1, 1, true);

      expect(mockPrismaService.userPermissions.update).toHaveBeenCalled();
    });
  });

  describe('revokePermissionFromUser', () => {
    it('should revoke permission', async () => {
      mockPrismaService.userPermissions.findUnique.mockResolvedValue({
        idUserPermissions: 1,
        deletedAt: null,
      });
      mockPrismaService.userPermissions.update.mockResolvedValue({
        idUserPermissions: 1,
        deletedAt: new Date(),
      });

      await service.revokePermissionFromUser(1);

      expect(mockPrismaService.userPermissions.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent assignment', async () => {
      mockPrismaService.userPermissions.findUnique.mockResolvedValue(null);

      await expect(service.revokePermissionFromUser(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if already revoked', async () => {
      mockPrismaService.userPermissions.findUnique.mockResolvedValue({
        idUserPermissions: 1,
        deletedAt: new Date(),
      });

      await expect(service.revokePermissionFromUser(1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getEffectivePermissions', () => {
    it('should combine role and direct permissions', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({
        usersId: 1,
        deletedAt: null,
        role: { rolesId: 1, deletedAt: null },
        userPermissions: [
          {
            idUserPermissions: 1,
            allow: true,
            Permissions: { resource: 'extra', action: 'read', deletedAt: null },
          },
        ],
      });
      mockPrismaService.rolesHeredados.findMany.mockResolvedValue([]);
      mockPrismaService.rolPermissions.findMany.mockResolvedValue([
        { permissions: { resource: 'role-perm', action: 'read' } },
      ]);

      const result = await service.getEffectivePermissions(1);

      expect(result).toContainEqual({ resource: 'role-perm', action: 'read' });
      expect(result).toContainEqual({ resource: 'extra', action: 'read' });
    });

    it('should throw NotFoundException for deleted user', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.getEffectivePermissions(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
