import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../application/user.service';
import {
  UserResponseDto,
  UserDetailResponseDto,
  UserProfileResponseDto,
} from '../dto/user-response.dto';

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
            updateUser: jest.fn(),
            softDeleteUser: jest.fn(),
            getEffectivePermissions: jest.fn(),
            findMe: jest.fn(),
            updateAvatar: jest.fn(),
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
        nombres: 'Test',
        apellidos: 'User',
        telefono: '123456',
        rolId: 1,
      };
      const mockUser = {
        usuarioId: 1,
        email: 'test@example.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '123456',
        avatar: null,
        rol: { rolId: 1, nombre: 'user' },
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser as any);

      const result = await controller.create(createUserDto);

      expect(userService.createUser).toHaveBeenCalledWith(
        createUserDto,
        undefined,
      );
      expect(result).toEqual(UserResponseDto.fromEntity(mockUser as any));
    });
  });

  describe('findAll', () => {
    it('should call userService.users with pagination params', async () => {
      const mockResult = { data: [], meta: {} };

      jest.spyOn(userService, 'users').mockResolvedValue(mockResult as any);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(userService.users).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should call userService.user with correct id', async () => {
      const userId = 1;
      const mockUser = {
        usuarioId: userId,
        email: 'test@example.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '123456',
        avatar: null,
        rol: null,
      };

      jest.spyOn(userService, 'user').mockResolvedValue(mockUser as any);

      const result = await controller.findOne(userId);

      expect(userService.user).toHaveBeenCalledWith({ usuarioId: userId });
      expect(result).toEqual(UserDetailResponseDto.fromEntity(mockUser as any));
    });
  });

  describe('findMe', () => {
    it('should call userService.findMe with correct usersId', async () => {
      const usersId = 1;
      const mockProfile = {
        usuarioId: usersId,
        email: 'test@t.com',
        nombre: 'Test User',
        telefono: '123456',
        avatar: null,
        rol: { rolId: 1, nombre: 'admin' },
      };

      jest.spyOn(userService, 'findMe').mockResolvedValue(mockProfile as any);

      const result = await controller.findMe(usersId);

      expect(userService.findMe).toHaveBeenCalledWith(usersId);
      expect(result).toEqual(
        UserProfileResponseDto.fromEntity(mockProfile as any),
      );
    });
  });

  describe('updateUser', () => {
    it('should call userService.updateUser with correct data', async () => {
      const userId = 1;
      const updateUserDto = {
        email: 'newemail@example.com',
        nombres: 'Updated',
        rolId: 2,
      };
      const mockUpdatedUser = {
        usuarioId: userId,
        email: 'newemail@example.com',
        nombres: 'Updated',
        apellidos: 'User',
        telefono: '123456',
        avatar: null,
        rol: { rolId: 2, nombre: 'admin' },
      };

      jest
        .spyOn(userService, 'updateUser')
        .mockResolvedValue(mockUpdatedUser as any);

      const result = await controller.updateUser(userId, updateUserDto);

      expect(userService.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        undefined,
      );
      expect(result).toEqual(
        UserDetailResponseDto.fromEntity(mockUpdatedUser as any),
      );
    });
  });

  describe('remove', () => {
    it('should call userService.softDeleteUser with correct id', async () => {
      const userId = 1;
      const mockResult = { message: 'Usuario eliminado exitosamente' };

      jest
        .spyOn(userService, 'softDeleteUser')
        .mockResolvedValue({ usuarioId: userId } as any);

      const result = await controller.remove(userId);

      expect(userService.softDeleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResult);
    });
  });
});
