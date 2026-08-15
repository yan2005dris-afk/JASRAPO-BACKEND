import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../../roles/domain/repositories/role.repository';
import { UpdateUserPermissionsUseCase } from './update-user-permissions.use-case';
import { GetUserDetailUseCase } from './get-user-detail.use-case';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import {
  uploadAvatar,
  rollbackAvatarUpload,
  deleteOldAvatar,
} from '../avatar-upload.helper';

jest.mock('../avatar-upload.helper', () => ({
  uploadAvatar: jest.fn(),
  rollbackAvatarUpload: jest.fn(),
  deleteOldAvatar: jest.fn(),
}));

const mockedUploadAvatar = uploadAvatar as jest.Mock;
const mockedRollbackAvatarUpload = rollbackAvatarUpload as jest.Mock;
const mockedDeleteOldAvatar = deleteOldAvatar as jest.Mock;

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: any;
  let roleRepository: any;
  let updateUserPermissionsUseCase: any;
  let getUserDetailUseCase: any;

  const txMock = {};
  const file = { buffer: Buffer.from('image'), mimetype: 'image/png' } as any;

  const existingUser = {
    usuarioId: 1,
    email: 'user@example.com',
    nombres: 'Juan',
    apellidos: 'Perez',
    telefono: '0991234567',
    avatar: null,
    deletedAt: null,
    rol: { rolId: 1, nombre: 'user', deletedAt: null },
  };

  const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn((callback: (tx: any) => Promise<any>) =>
      callback(txMock),
    ),
  };

  const mockRoleRepository = {
    findUnique: jest.fn(),
  };

  const mockUpdateUserPermissionsUseCase = {
    execute: jest.fn(),
  };

  const mockGetUserDetailUseCase = {
    execute: jest.fn(),
  };

  const mockStorageService = {
    upload: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RoleRepository, useValue: mockRoleRepository },
        {
          provide: UpdateUserPermissionsUseCase,
          useValue: mockUpdateUserPermissionsUseCase,
        },
        {
          provide: GetUserDetailUseCase,
          useValue: mockGetUserDetailUseCase,
        },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get(UserRepository);
    roleRepository = module.get(RoleRepository);
    updateUserPermissionsUseCase = module.get(UpdateUserPermissionsUseCase);
    getUserDetailUseCase = module.get(GetUserDetailUseCase);

    mockUserRepository.findById.mockResolvedValue(existingUser);
    mockUserRepository.update.mockResolvedValue({ usuarioId: 1 });
    mockGetUserDetailUseCase.execute.mockResolvedValue({
      usuarioId: 1,
      email: 'updated@example.com',
      permisosDirectos: [],
      permisosRol: [],
    });
  });

  it('should update the requested fields and return the refreshed detail', async () => {
    const detail = { usuarioId: 1, email: 'updated@example.com' };
    mockGetUserDetailUseCase.execute.mockResolvedValue(detail);

    const result = await useCase.execute(1, { email: 'updated@example.com' });

    expect(mockUserRepository.update).toHaveBeenCalledWith(
      1,
      { email: 'updated@example.com' },
      txMock,
    );
    expect(mockGetUserDetailUseCase.execute).toHaveBeenCalledWith({
      usuarioId: 1,
    });
    expect(result).toBe(detail);
  });

  it('should delegate direct permissions to UpdateUserPermissionsUseCase inside the transaction', async () => {
    const permissions = [{ permisoId: 5, permitido: false }];

    await useCase.execute(1, { directPermissions: permissions });

    expect(mockUpdateUserPermissionsUseCase.execute).toHaveBeenCalledWith(
      1,
      permissions,
      txMock,
    );
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when a field is empty', async () => {
    await expect(useCase.execute(1, { nombres: '   ' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when the phone is invalid', async () => {
    await expect(useCase.execute(1, { telefono: '123' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw EntityNotFoundException when the user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, { email: 'a@b.com' })).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw InvalidDomainOperationException when the user is soft-deleted', async () => {
    mockUserRepository.findById.mockResolvedValue({
      ...existingUser,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(1, { email: 'a@b.com' })).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should throw EntityNotFoundException when the role does not exist', async () => {
    mockRoleRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1, { rolId: 999 })).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should upload a new avatar, persist it and delete the old one on success', async () => {
    mockUserRepository.findById.mockResolvedValue({
      ...existingUser,
      avatar: { url: 'old-url', key: 'avatars/old.webp' },
    });
    mockedUploadAvatar.mockResolvedValue('avatars/new.webp');

    await useCase.execute(1, { email: 'a@b.com' }, file);

    expect(mockedUploadAvatar).toHaveBeenCalledWith(file, mockStorageService);
    expect(mockUserRepository.update).toHaveBeenCalledWith(
      1,
      { email: 'a@b.com', avatar: { key: 'avatars/new.webp' } },
      txMock,
    );
    expect(mockedDeleteOldAvatar).toHaveBeenCalledWith(
      'avatars/old.webp',
      'avatars/new.webp',
      mockStorageService,
    );
  });

  it('should rollback the new avatar upload when the transaction fails', async () => {
    mockUserRepository.findById.mockResolvedValue({
      ...existingUser,
      avatar: { url: 'old-url', key: 'avatars/old.webp' },
    });
    mockedUploadAvatar.mockResolvedValue('avatars/new.webp');
    const dbError = new Error('DB down');
    mockUserRepository.executeTransaction.mockRejectedValueOnce(dbError);

    await expect(
      useCase.execute(1, { email: 'a@b.com' }, file),
    ).rejects.toThrow(dbError);

    expect(mockedRollbackAvatarUpload).toHaveBeenCalledWith(
      'avatars/new.webp',
      mockStorageService,
    );
    expect(mockedDeleteOldAvatar).not.toHaveBeenCalled();
  });

  it('should not upload when no file is provided', async () => {
    await useCase.execute(1, { email: 'a@b.com' });

    expect(mockedUploadAvatar).not.toHaveBeenCalled();
    expect(mockedDeleteOldAvatar).toHaveBeenCalledWith(
      undefined,
      undefined,
      mockStorageService,
    );
  });
});
