import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { AssignRoleToUserUseCase } from './use-cases/assign-role-to-user.use-case';
import { AssignPermissionToUserUseCase } from './use-cases/assign-permission-to-user.use-case';
import { RevokePermissionFromUserUseCase } from './use-cases/revoke-permission-from-user.use-case';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let createUserUseCase: CreateUserUseCase;
  let getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase;
  let assignRoleUseCase: AssignRoleToUserUseCase;
  let assignPermissionUseCase: AssignPermissionToUserUseCase;
  let revokePermissionUseCase: RevokePermissionFromUserUseCase;

  const mockPrismaService = {
    usuarios: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    usuarioPermisos: {
      findMany: jest.fn(),
    },
  };

  const mockUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CreateUserUseCase, useValue: { execute: jest.fn() } },
        { provide: GetEffectivePermissionsUseCase, useValue: { execute: jest.fn() } },
        { provide: AssignRoleToUserUseCase, useValue: { execute: jest.fn() } },
        { provide: AssignPermissionToUserUseCase, useValue: { execute: jest.fn() } },
        { provide: RevokePermissionFromUserUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    getEffectivePermissionsUseCase = module.get<GetEffectivePermissionsUseCase>(
      GetEffectivePermissionsUseCase,
    );
    assignRoleUseCase = module.get<AssignRoleToUserUseCase>(
      AssignRoleToUserUseCase,
    );
    assignPermissionUseCase = module.get<AssignPermissionToUserUseCase>(
      AssignPermissionToUserUseCase,
    );
    revokePermissionUseCase = module.get<RevokePermissionFromUserUseCase>(
      RevokePermissionFromUserUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should delegate to CreateUserUseCase', async () => {
      const dto = { email: 'test@test.com', clave: 'password123' };
      await service.createUser(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('user', () => {
    it('should return user from prisma', async () => {
      mockPrismaService.usuarios.findUnique.mockResolvedValue({ usuarioId: 1 });
      const result = await service.user({ usuarioId: 1 });
      expect(result).toEqual({ usuarioId: 1 });
    });
  });

  describe('users', () => {
    it('should return users from prisma and map roles', async () => {
      mockPrismaService.usuarios.findMany.mockResolvedValue([
        {
          usuarioId: 1,
          email: 't@t.com',
          rol: { rolId: 1, nombre: 'admin', deletedAt: null },
        },
      ]);
      const result = await service.users({});
      expect(result[0].roles).toEqual([{ rolId: 1, nombre: 'admin' }]);
    });
  });

  describe('updateUser', () => {
    it('should hash password and update via prisma', async () => {
      mockPrismaService.usuarios.update.mockResolvedValue({ usuarioId: 1 });
      await service.updateUser({
        where: { usuarioId: 1 },
        data: { clave: 'new' },
      });
      expect(mockPrismaService.usuarios.update).toHaveBeenCalled();
      const updateCall = mockPrismaService.usuarios.update.mock.calls[0][0];
      expect(updateCall.data.clave).toMatch(/^\$2[aby]\$\d{2}\$/);
    });
  });

  describe('softDeleteUser', () => {
    it('should update deletedAt via prisma', async () => {
      await service.softDeleteUser({ usuarioId: 1 });
      expect(mockPrismaService.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { deletedAt: expect.any(Date) } }),
      );
    });
  });

  describe('assignRoleToUser', () => {
    it('should delegate to AssignRoleToUserUseCase', async () => {
      await service.assignRoleToUser(1, 2);
      expect(assignRoleUseCase.execute).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('assignPermissionToUser', () => {
    it('should delegate to AssignPermissionToUserUseCase', async () => {
      await service.assignPermissionToUser(1, 2, true);
      expect(assignPermissionUseCase.execute).toHaveBeenCalledWith(1, 2, true);
    });
  });

  describe('revokePermissionFromUser', () => {
    it('should delegate to RevokePermissionFromUserUseCase', async () => {
      await service.revokePermissionFromUser(1);
      expect(revokePermissionUseCase.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('getEffectivePermissions', () => {
    it('should delegate to GetEffectivePermissionsUseCase', async () => {
      await service.getEffectivePermissions(1);
      expect(getEffectivePermissionsUseCase.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('getRolesByUserId', () => {
    it('should return role name from prisma', async () => {
      mockPrismaService.usuarios.findUnique.mockResolvedValue({
        rol: { nombre: 'admin', deletedAt: null },
      });
      const result = await service.getRolesByUserId(1);
      expect(result).toBe('admin');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.usuarios.findUnique.mockResolvedValue(null);
      await expect(service.getRolesByUserId(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
