import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetEffectivePermissionsUseCase } from './get-effective-permissions.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { NotFoundException } from '@nestjs/common';

describe('GetEffectivePermissionsUseCase', () => {
  let useCase: GetEffectivePermissionsUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findUnique: jest.fn(),
    findRolePermissions: jest.fn(),
    findDirectPermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEffectivePermissionsUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<GetEffectivePermissionsUseCase>(
      GetEffectivePermissionsUseCase,
    );
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should combine role and direct permissions', async () => {
    mockUserRepository.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rolId: 1,
    });
    mockUserRepository.findRolePermissions.mockResolvedValue([
      { permiso: { recurso: 'role-perm', accion: 'read' } },
    ]);
    mockUserRepository.findDirectPermissions.mockResolvedValue([
      {
        permitido: true,
        permiso: { recurso: 'extra', accion: 'read', deletedAt: null },
      },
    ]);

    const result = await useCase.execute(1);

    expect(result).toContainEqual({ recurso: 'role-perm', accion: 'read' });
    expect(result).toContainEqual({ recurso: 'extra', accion: 'read' });
  });

  it('should exclude revoked permissions', async () => {
    mockUserRepository.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rolId: 1,
    });
    mockUserRepository.findRolePermissions.mockResolvedValue([
      { permiso: { recurso: 'role-perm', accion: 'read' } },
    ]);
    mockUserRepository.findDirectPermissions.mockResolvedValue([
      {
        permitido: false,
        permiso: {
          recurso: 'role-perm',
          accion: 'read',
          deletedAt: null,
        },
      },
    ]);

    const result = await useCase.execute(1);

    expect(result).not.toContainEqual({
      recurso: 'role-perm',
      accion: 'read',
    });
  });

  it('should throw NotFoundException if user not found or deleted', async () => {
    mockUserRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
