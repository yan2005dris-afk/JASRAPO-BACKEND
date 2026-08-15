import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateUserAvatarUseCase } from './update-user-avatar.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
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

describe('UpdateUserAvatarUseCase', () => {
  let useCase: UpdateUserAvatarUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockStorageService = {
    upload: jest.fn(),
    delete: jest.fn(),
  };

  const file = { buffer: Buffer.from('image'), mimetype: 'image/png' } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserAvatarUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    useCase = module.get<UpdateUserAvatarUseCase>(UpdateUserAvatarUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should upload the avatar, persist it and return the new avatar', async () => {
    mockUserRepository.findById
      .mockResolvedValueOnce({
        usuarioId: 1,
        deletedAt: null,
        avatar: null,
      })
      .mockResolvedValueOnce({
        usuarioId: 1,
        deletedAt: null,
        avatar: {
          url: '/api/v1/storage/profile-photos/avatars--new.webp',
          key: 'avatars/new.webp',
        },
      });
    mockedUploadAvatar.mockResolvedValue('avatars/new.webp');
    mockUserRepository.update.mockResolvedValue({ usuarioId: 1 });

    const result = await useCase.execute(1, file);

    expect(mockedUploadAvatar).toHaveBeenCalledWith(file, mockStorageService);
    expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
      avatar: { key: 'avatars/new.webp' },
    });
    expect(mockedDeleteOldAvatar).toHaveBeenCalledWith(
      undefined,
      'avatars/new.webp',
      mockStorageService,
    );
    expect(result).toEqual({
      url: '/api/v1/storage/profile-photos/avatars--new.webp',
      key: 'avatars/new.webp',
    });
  });

  it('should delete the old avatar after replacing it', async () => {
    mockUserRepository.findById.mockResolvedValueOnce({
      usuarioId: 1,
      deletedAt: null,
      avatar: { url: 'old-url', key: 'avatars/old.webp' },
    });
    mockedUploadAvatar.mockResolvedValue('avatars/new.webp');
    mockUserRepository.update.mockResolvedValue({ usuarioId: 1 });
    mockUserRepository.findById.mockResolvedValueOnce({
      usuarioId: 1,
      deletedAt: null,
      avatar: { url: 'new-url', key: 'avatars/new.webp' },
    });

    await useCase.execute(1, file);

    expect(mockedDeleteOldAvatar).toHaveBeenCalledWith(
      'avatars/old.webp',
      'avatars/new.webp',
      mockStorageService,
    );
  });

  it('should rollback the new upload when persisting fails', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      avatar: null,
    });
    mockedUploadAvatar.mockResolvedValue('avatars/new.webp');
    const dbError = new Error('DB down');
    mockUserRepository.update.mockRejectedValue(dbError);

    await expect(useCase.execute(1, file)).rejects.toThrow(dbError);

    expect(mockedRollbackAvatarUpload).toHaveBeenCalledWith(
      'avatars/new.webp',
      mockStorageService,
    );
  });

  it('should propagate the upload error without persisting or rolling back', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      avatar: null,
    });
    const processingError = new Error(
      'No se proporcionó un buffer de imagen válido',
    );
    mockedUploadAvatar.mockRejectedValue(processingError);

    await expect(useCase.execute(1, file)).rejects.toThrow(processingError);

    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockedRollbackAvatarUpload).not.toHaveBeenCalled();
  });

  it('should throw EntityNotFoundException when the user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, file)).rejects.toThrow(
      EntityNotFoundException,
    );
    expect(mockedUploadAvatar).not.toHaveBeenCalled();
  });

  it('should throw EntityNotFoundException when the user is soft-deleted', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(1, file)).rejects.toThrow(
      EntityNotFoundException,
    );
  });
});
