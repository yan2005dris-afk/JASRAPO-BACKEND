import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateUserPermissionsUseCase } from './update-user-permissions.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { NotFoundException } from '@nestjs/common';

describe('UpdateUserPermissionsUseCase', () => {
  let useCase: UpdateUserPermissionsUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findUnique: jest.fn(),
    updatePermissions: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserPermissionsUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserPermissionsUseCase>(
      UpdateUserPermissionsUseCase,
    );
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockUserRepository.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(1, [{ permisoId: 1, permitido: true }]),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if user is deleted', async () => {
    mockUserRepository.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: new Date(),
    });

    await expect(
      useCase.execute(1, [{ permisoId: 1, permitido: true }]),
    ).rejects.toThrow(NotFoundException);
  });

  it('should call updatePermissions on the repository', async () => {
    mockUserRepository.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    const permissions = [{ permisoId: 10, permitido: true }];
    await useCase.execute(1, permissions);

    expect(mockUserRepository.updatePermissions).toHaveBeenCalledWith(
      1,
      permissions,
      undefined,
    );
  });
});
