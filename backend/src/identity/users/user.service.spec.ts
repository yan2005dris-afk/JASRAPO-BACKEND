import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { GetUserDirectPermissionsUseCase } from './use-cases/get-user-direct-permissions.use-case';
import { GetUserRolePermissionsUseCase } from './use-cases/get-user-role-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './use-cases/update-user-permissions.use-case';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let createUserUseCase: CreateUserUseCase;
  let getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase;
  let updateUserPermissionsUseCase: UpdateUserPermissionsUseCase;
  let getUserDirectPermissionsUseCase: GetUserDirectPermissionsUseCase;
  let getUserRolePermissionsUseCase: GetUserRolePermissionsUseCase;

  const mockPrismaService = {
    usuarios: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    usuarioPermisos: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    rolPermisos: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CreateUserUseCase, useValue: { execute: jest.fn() } },
        {
          provide: GetEffectivePermissionsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUserDirectPermissionsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUserRolePermissionsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserPermissionsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    getEffectivePermissionsUseCase = module.get<GetEffectivePermissionsUseCase>(
      GetEffectivePermissionsUseCase,
    );
    getUserDirectPermissionsUseCase =
      module.get<GetUserDirectPermissionsUseCase>(
        GetUserDirectPermissionsUseCase,
      );
    getUserRolePermissionsUseCase = module.get<GetUserRolePermissionsUseCase>(
      GetUserRolePermissionsUseCase,
    );
    updateUserPermissionsUseCase = module.get<UpdateUserPermissionsUseCase>(
      UpdateUserPermissionsUseCase,
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
      await service.createUser(dto as any);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('user', () => {
    it('should return user from prisma with direct and role permissions', async () => {
      mockPrismaService.usuarios.findUnique.mockResolvedValue({
        usuarioId: 1,
        email: 'test@test.com',
        nombres: 'John',
        apellidos: 'Doe',
        telefono: '123456',
        avatar: null,
        rolId: 1,
        rol: { rolId: 1, nombre: 'admin', deletedAt: null },
      });

      (getUserDirectPermissionsUseCase.execute as jest.Mock).mockResolvedValue(
        [],
      );
      (getUserRolePermissionsUseCase.execute as jest.Mock).mockResolvedValue([
        { recurso: 'test', accion: 'read' },
      ]);

      const result = await service.user({ usuarioId: 1 });

      expect(result).toEqual({
        usuarioId: 1,
        email: 'test@test.com',
        nombres: 'John',
        apellidos: 'Doe',
        telefono: '123456',
        avatar: null,
        role: { rolId: 1, nombre: 'admin' },
        directPermissions: [],
        rolePermissions: [{ resource: 'test', action: 'read' }],
      });
    });
  });

  describe('users', () => {
    it('should return paginated users from prisma', async () => {
      const mockPrismaUsers = [
        {
          usuarioId: 1,
          email: 't@t.com',
          nombres: 'John',
          apellidos: 'Doe',
          telefono: '123456',
          avatar: null,
          rol: { rolId: 1, nombre: 'admin', deletedAt: null },
        },
      ];
      mockPrismaService.usuarios.findMany.mockResolvedValue(mockPrismaUsers);
      mockPrismaService.usuarios.count.mockResolvedValue(1);

      const result = await service.users({ page: 1, limit: 10 });

      expect(result.data).toEqual([
        {
          usuarioId: 1,
          email: 't@t.com',
          nombres: 'John',
          apellidos: 'Doe',
          telefono: '123456',
          avatar: null,
          role: { rolId: 1, nombre: 'admin' },
        },
      ]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.currentPage).toBe(1);
    });
  });

  describe('updateUser', () => {
    it('should hash password and update via prisma', async () => {
      mockPrismaService.usuarios.update.mockResolvedValue({ usuarioId: 1 });
      mockPrismaService.usuarios.findUnique.mockResolvedValue({
        usuarioId: 1,
        rol: null,
      });
      (getUserDirectPermissionsUseCase.execute as jest.Mock).mockResolvedValue(
        [],
      );
      (getUserRolePermissionsUseCase.execute as jest.Mock).mockResolvedValue(
        [],
      );

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

  describe('updateUser', () => {
    it('should delegate to UpdateUserPermissionsUseCase when directPermissions provided', async () => {
      const mockUpdatedUser = { usuarioId: 1 };
      const mockDirectPermissions = [{ permisoId: 1, permitido: true }];

      mockPrismaService.usuarios.update.mockResolvedValue(mockUpdatedUser);
      (getUserDirectPermissionsUseCase.execute as jest.Mock).mockResolvedValue(
        [],
      );
      (getUserRolePermissionsUseCase.execute as jest.Mock).mockResolvedValue(
        [],
      );

      await service.updateUser({
        where: { usuarioId: 1 },
        data: { nombres: 'Test', directPermissions: mockDirectPermissions },
      });

      expect(updateUserPermissionsUseCase.execute).toHaveBeenCalledWith(
        1,
        mockDirectPermissions,
      );
    });
  });

  describe('getEffectivePermissions', () => {
    it('should delegate to GetEffectivePermissionsUseCase and return wrapped response', async () => {
      const mockPerms = [{ resource: 'test', action: 'read' }];
      (getEffectivePermissionsUseCase.execute as jest.Mock).mockResolvedValue(
        mockPerms as any,
      );

      const result = await service.getEffectivePermissions(1);

      expect(result).toEqual({
        usuarioId: 1,
        permissions: mockPerms,
      });
      expect(getEffectivePermissionsUseCase.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('findMe', () => {
    it('should return profile with role info', async () => {
      mockPrismaService.usuarios.findUnique.mockResolvedValue({
        usuarioId: 1,
        email: 'test@test.com',
        nombres: 'John',
        apellidos: 'Doe',
        telefono: '123456',
        avatar: { url: 'avatar.png' },
        rol: { rolId: 1, nombre: 'admin', deletedAt: null },
      });

      const result = await service.findMe(1);

      expect(result).toEqual({
        usuarioId: 1,
        email: 'test@test.com',
        name: 'John Doe',
        phone: '123456',
        avatar: { url: 'avatar.png' },
        role: { rolId: 1, nombre: 'admin' },
      });
    });

    it('should throw NotFoundException if profile user not found', async () => {
      mockPrismaService.usuarios.findUnique.mockResolvedValue(null);

      await expect(service.findMe(1)).rejects.toThrow(NotFoundException);
    });
  });
});
