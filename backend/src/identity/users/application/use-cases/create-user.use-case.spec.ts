import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';
import { uploadAvatar, rollbackAvatarUpload } from '../avatar-upload.helper';

jest.mock('../avatar-upload.helper', () => ({
  uploadAvatar: jest.fn(),
  rollbackAvatarUpload: jest.fn(),
  deleteOldAvatar: jest.fn(),
}));

const mockedUploadAvatar = uploadAvatar as jest.Mock;
const mockedRollbackAvatarUpload = rollbackAvatarUpload as jest.Mock;

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockRoleRepository = {
    findUnique: jest.fn(),
    findByName: jest.fn(),
  };

  const mockStorageService = {
    upload: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create user with default role when rolId not provided', async () => {
    const dto = {
      email: 'test@example.com',
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '0991234567',
    };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findByName.mockResolvedValue({
      rolId: 1,
      nombre: 'user',
    });
    mockUserRepository.create.mockResolvedValue({
      usuarioId: 1,
      email: 'test@example.com',
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '0991234567',
      rol: {
        rolId: 1,
        nombre: 'user',
      },
      avatar: null,
    });

    const result = await useCase.execute(dto);

    expect(result).toEqual({
      usuarioId: 1,
      email: 'test@example.com',
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '0991234567',
      avatar: null,
      rol: {
        rolId: 1,
        nombre: 'user',
      },
    });
    expect(mockRoleRepository.findByName).toHaveBeenCalledWith('user');
  });

  it('should fail if default user role is soft-deleted', async () => {
    const dto = {
      email: 'test@example.com',
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '0991234567',
    };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findByName.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(EntityNotFoundException);
    expect(mockRoleRepository.findByName).toHaveBeenCalledWith('user');
  });

  it('should use provided rolId when specified', async () => {
    const dto = {
      email: 'admin@example.com',
      nombres: 'Admin',
      apellidos: 'User',
      telefono: '0998765432',
      rolId: 2,
    };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findUnique.mockResolvedValue({
      rolId: 2,
      nombre: 'admin',
      deletedAt: null,
    });
    mockUserRepository.create.mockResolvedValue({
      usuarioId: 2,
      email: 'admin@example.com',
      nombres: 'Admin',
      apellidos: 'User',
      telefono: '0998765432',
      rol: { rolId: 2, nombre: 'admin' },
      avatar: null,
    });

    const result = await useCase.execute(dto);

    expect(result.rol).toEqual({ rolId: 2, nombre: 'admin' });
    expect(mockRoleRepository.findUnique).toHaveBeenCalledWith(2);
  });

  it('should throw EntityNotFoundException if provided rolId does not exist', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findUnique.mockResolvedValue(null);
    await expect(
      useCase.execute({
        email: 't@t.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '0991234567',
        rolId: 999,
      }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw BadRequestException for invalid Ecuador phone', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({
        email: 't@t.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '123',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw EntityAlreadyExistsException if email is already taken', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      usuarioId: 1,
      email: 'taken@example.com',
    });
    await expect(
      useCase.execute({
        email: 'taken@example.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '0991234567',
      }),
    ).rejects.toThrow(EntityAlreadyExistsException);
  });

  it('should throw EntityAlreadyExistsException if email belongs to a deleted user', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      usuarioId: 1,
      email: 'deleted@example.com',
      deletedAt: new Date(),
    });
    await expect(
      useCase.execute({
        email: 'deleted@example.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '0991234567',
      }),
    ).rejects.toThrow(EntityAlreadyExistsException);
  });

  it('should upload the avatar and pass its key to create when a file is provided', async () => {
    const dto = {
      email: 'avatar@example.com',
      nombres: 'Avatar',
      apellidos: 'User',
      telefono: '0991234567',
    };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findByName.mockResolvedValue({
      rolId: 1,
      nombre: 'user',
    });
    mockedUploadAvatar.mockResolvedValue('avatars/uuid.webp');
    mockUserRepository.create.mockResolvedValue({ usuarioId: 1 } as any);

    await useCase.execute(dto, { buffer: Buffer.from('img') } as any);

    expect(mockedUploadAvatar).toHaveBeenCalledWith(
      expect.anything(),
      mockStorageService,
    );
    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar: { key: 'avatars/uuid.webp' },
        rolId: 1,
      }),
    );
  });

  it('should rollback the uploaded avatar when create fails', async () => {
    const dto = {
      email: 'rollback@example.com',
      nombres: 'Rollback',
      apellidos: 'User',
      telefono: '0991234567',
    };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleRepository.findByName.mockResolvedValue({
      rolId: 1,
      nombre: 'user',
    });
    mockedUploadAvatar.mockResolvedValue('avatars/uuid.webp');
    mockUserRepository.create.mockRejectedValue(new Error('DB down'));

    await expect(
      useCase.execute(dto, { buffer: Buffer.from('img') } as any),
    ).rejects.toThrow('DB down');

    expect(mockedRollbackAvatarUpload).toHaveBeenCalledWith(
      'avatars/uuid.webp',
      mockStorageService,
    );
  });
});
