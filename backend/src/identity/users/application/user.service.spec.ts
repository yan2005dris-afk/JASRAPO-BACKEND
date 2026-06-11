import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../domain/repositories/user.repository';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './use-cases/update-user-permissions.use-case';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase;
  let updateUserPermissionsUseCase: UpdateUserPermissionsUseCase;

  const mockUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findManyActive: jest.fn(),
    update: jest.fn(),
    findRoleById: jest.fn(),
    findDirectPermissions: jest.fn(),
    findRolePermissions: jest.fn(),
    executeTransaction: jest.fn((cb) => cb(null)),
  };

  const mockGetEffectivePermissionsUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateUserPermissionsUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: CreateUserUseCase, useValue: {} },
        {
          provide: GetEffectivePermissionsUseCase,
          useValue: mockGetEffectivePermissionsUseCase,
        },
        {
          provide: UpdateUserPermissionsUseCase,
          useValue: mockUpdateUserPermissionsUseCase,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    getEffectivePermissionsUseCase = module.get<GetEffectivePermissionsUseCase>(
      GetEffectivePermissionsUseCase,
    );
    updateUserPermissionsUseCase = module.get<UpdateUserPermissionsUseCase>(
      UpdateUserPermissionsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('user', () => {
    it('should return user with mapped permissions and roles', async () => {
      const mockUser = {
        usuarioId: 1,
        email: 'test@test.com',
        nombres: 'John',
        apellidos: 'Doe',
        telefono: '123456',
        avatar: null,
        rol: { rolId: 1, nombre: 'admin', deletedAt: null },
      };

      const mockDirect = [
        {
          usuarioPermisoId: 10,
          permisoId: 1,
          permitido: true,
          permiso: { permisoId: 1, recurso: 'users', accion: 'read' },
        },
      ];

      const mockRolePerms = [
        { permiso: { recurso: 'users', accion: 'write' } },
      ];

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findDirectPermissions.mockResolvedValue(mockDirect);
      mockUserRepository.findRolePermissions.mockResolvedValue(mockRolePerms);

      const result = await service.user({ usuarioId: 1 });

      expect(result).toEqual({
        usuarioId: 1,
        email: 'test@test.com',
        nombres: 'John',
        apellidos: 'Doe',
        telefono: '123456',
        avatar: null,
        rol: { rolId: 1, nombre: 'admin' },
        permisosDirectos: [
          {
            usuarioPermisoId: 10,
            permisoId: 1,
            recurso: 'users',
            accion: 'read',
            permitido: true,
          },
        ],
        permisosRol: [{ recurso: 'users', accion: 'write' }],
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      const result = await service.user({ usuarioId: 999 });
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should call updateUserPermissionsUseCase if directPermissions provided', async () => {
      mockUserRepository.findById.mockResolvedValue({
        usuarioId: 1,
        deletedAt: null,
      } as any);
      const mockUpdatedUser = { usuarioId: 1 };
      const mockDirectPermissions = [{ permisoId: 1, permitido: true }];

      mockUserRepository.update.mockResolvedValue(mockUpdatedUser as any);

      await service.updateUser(1, { nombres: 'Test', directPermissions: mockDirectPermissions });

      expect(updateUserPermissionsUseCase.execute).toHaveBeenCalledWith(
        1,
        mockDirectPermissions,
        null,
      );
    });

    it('should throw NotFoundException if rolId is invalid (not found)', async () => {
      mockUserRepository.findById.mockResolvedValue({
        usuarioId: 1,
        deletedAt: null,
      } as any);
      mockUserRepository.findRoleById.mockResolvedValue(null);

      await expect(
        service.updateUser(1, { rolId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if rolId is invalid (soft-deleted)', async () => {
      mockUserRepository.findById.mockResolvedValue({
        usuarioId: 1,
        deletedAt: null,
      } as any);
      mockUserRepository.findRoleById.mockResolvedValue({
        rolId: 2,
        deletedAt: new Date(),
      });

      await expect(
        service.updateUser(1, { rolId: 2 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEffectivePermissions', () => {
    it('should delegate to GetEffectivePermissionsUseCase and return wrapped response', async () => {
      const mockPerms = [{ recurso: 'test', accion: 'read' }];
      (getEffectivePermissionsUseCase.execute as jest.Mock).mockResolvedValue(
        mockPerms as any,
      );

      const result = await service.getEffectivePermissions(1);

      expect(result).toEqual({
        usuarioId: 1,
        permisos: mockPerms,
      });
      expect(getEffectivePermissionsUseCase.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('findMe', () => {
    it('should return profile with rol info', async () => {
      mockUserRepository.findById.mockResolvedValue({
        usuarioId: 1,
        email: 'test@test.com',
        nombres: 'John',
        apellidos: 'Doe',
        telefono: '123456',
        avatar: { url: 'avatar.png' },
        rol: { rolId: 1, logo: null, nombre: 'admin', deletedAt: null },
      } as any);

      const result = await service.findMe(1);

      expect(result).toEqual({
        usuarioId: 1,
        email: 'test@test.com',
        nombre: 'John Doe',
        telefono: '123456',
        avatar: { url: 'avatar.png' },
        rol: { rolId: 1, nombre: 'admin' },
      });
    });

    it('should throw NotFoundException if profile user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findMe(1)).rejects.toThrow(NotFoundException);
    });
  });
});
