import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            users: jest.fn(),
            user: jest.fn(),
            getRolesByUserId: jest.fn(),
            getRoleAssignmentsByUserId: jest.fn(),
            updateUser: jest.fn(),
            assignRoleToUser: jest.fn(),
            getDirectPermissionsByUserId: jest.fn(),
            assignPermissionToUser: jest.fn(),
            revokeRoleFromUser: jest.fn(),
            softDeleteUser: jest.fn(),
            revokePermissionFromUser: jest.fn(),
            getEffectivePermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call userService.createUser with correct data', async () => {
      const createUserDto = {
        email: 'test@example.com',
        clave: 'password123',
      };
      const mockUser = { usuarioId: 1, email: 'test@example.com' };

      jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should call userService.users without pagination', async () => {
      const mockUsers = [{ usuarioId: 1, email: 'test@example.com' }];

      jest.spyOn(userService, 'users').mockResolvedValue(mockUsers as never);

      const result = await controller.findAll();

      expect(userService.users).toHaveBeenCalledWith({});
      expect(result).toEqual(mockUsers);
    });

    it('should call userService.users with pagination params', async () => {
      const mockUsers = [{ usuarioId: 1, email: 'test@example.com' }];

      jest.spyOn(userService, 'users').mockResolvedValue(mockUsers as never);

      const result = await controller.findAll(10, 5);

      expect(userService.users).toHaveBeenCalledWith({ skip: 10, take: 5 });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should call userService.user with correct id', async () => {
      const userId = 1;
      const mockUser = { usuarioId: userId, email: 'test@example.com' };

      jest.spyOn(userService, 'user').mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(userService.user).toHaveBeenCalledWith({ usuarioId: userId });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserRole', () => {
    it('should call userService.getRolesByUserId with correct id', async () => {
      const userId = 1;
      const mockRoles = [{ nombre: 'admin' }];

      jest
        .spyOn(userService, 'getRolesByUserId')
        .mockResolvedValue(mockRoles as never);

      const result = await controller.getUserRole(userId);

      expect(userService.getRolesByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockRoles);
    });
  });

  describe('getUserRoleAssignment', () => {
    it('should call userService.getRoleAssignmentsByUserId with correct id', async () => {
      const userId = 1;
      const mockAssignment = { usuarioId: userId, rolId: 2, nombre: 'admin' };

      jest
        .spyOn(userService, 'getRoleAssignmentsByUserId')
        .mockResolvedValue(mockAssignment as never);

      const result = await controller.getUserRoleAssignment(userId);

      expect(userService.getRoleAssignmentsByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('updateUser', () => {
    it('should call userService.updateUser with correct data', async () => {
      const userId = 1;
      const updateUserDto = { email: 'newemail@example.com', clave: 'secret' };
      const mockUpdatedUser = {
        usuarioId: userId,
        email: 'newemail@example.com',
      };

      jest.spyOn(userService, 'updateUser').mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateUser(userId, updateUserDto);

      expect(userService.updateUser).toHaveBeenCalledWith({
        where: { usuarioId: userId },
        data: { email: updateUserDto.email, clave: updateUserDto.clave },
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('assignRole', () => {
    it('should call userService.assignRoleToUser with correct data', async () => {
      const userId = 1;
      const assignRoleDto = { rolId: 2 };
      const mockResult = { usuarioId: userId, rolId: 2, nombre: 'editor' };

      jest
        .spyOn(userService, 'assignRoleToUser')
        .mockResolvedValue(mockResult as never);

      const result = await controller.assignRole(userId, assignRoleDto);

      expect(userService.assignRoleToUser).toHaveBeenCalledWith(
        userId,
        assignRoleDto.rolId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserPermissions', () => {
    it('should call userService.getDirectPermissionsByUserId with correct id', async () => {
      const userId = 1;
      const mockPermissions = [{ nombre: 'users:read' }];

      jest
        .spyOn(userService, 'getDirectPermissionsByUserId')
        .mockResolvedValue(mockPermissions as never);

      const result = await controller.getUserPermissions(userId);

      expect(userService.getDirectPermissionsByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('assignPermission', () => {
    it('should call userService.assignPermissionToUser with correct data', async () => {
      const userId = 1;
      const assignPermissionDto = { permisoId: 1, permitido: true };
      const mockResult = { permitido: true };

      jest
        .spyOn(userService, 'assignPermissionToUser')
        .mockResolvedValue(mockResult as never);

      const result = await controller.assignPermission(
        userId,
        assignPermissionDto,
      );

      expect(userService.assignPermissionToUser).toHaveBeenCalledWith(
        userId,
        assignPermissionDto.permisoId,
        true,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('revokeRole', () => {
    it('should call userService.revokeRoleFromUser with correct id', async () => {
      const userId = 1;
      const mockResult = { revoked: true };

      jest
        .spyOn(userService, 'revokeRoleFromUser')
        .mockResolvedValue(mockResult as never);

      const result = await controller.revokeRole(userId);

      expect(userService.revokeRoleFromUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should call userService.softDeleteUser with correct id', async () => {
      const userId = 1;
      const mockResult = { deleted: true };

      jest
        .spyOn(userService, 'softDeleteUser')
        .mockResolvedValue(mockResult as never);

      const result = await controller.remove(userId);

      expect(userService.softDeleteUser).toHaveBeenCalledWith({
        usuarioId: userId,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('revokePermission', () => {
    it('should call userService.revokePermissionFromUser with correct userPermissionId', async () => {
      const userPermissionId = 1;
      const mockResult = { revoked: true };

      jest
        .spyOn(userService, 'revokePermissionFromUser')
        .mockResolvedValue(mockResult as never);

      const result = await controller.revokePermission(userPermissionId);

      expect(userService.revokePermissionFromUser).toHaveBeenCalledWith(
        userPermissionId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getEffectivePermissions', () => {
    it('should call userService.getEffectivePermissions with correct id', async () => {
      const userId = 1;
      const mockPermissions = [
        { nombre: 'users:read' },
        { nombre: 'users:create' },
      ];

      jest
        .spyOn(userService, 'getEffectivePermissions')
        .mockResolvedValue(mockPermissions as never);

      const result = await controller.getEffectivePermissions(userId);

      expect(userService.getEffectivePermissions).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockPermissions);
    });
  });
});
