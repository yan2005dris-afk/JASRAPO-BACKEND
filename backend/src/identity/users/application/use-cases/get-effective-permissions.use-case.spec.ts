import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetEffectivePermissionsUseCase } from './get-effective-permissions.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('GetEffectivePermissionsUseCase', () => {
  let useCase: GetEffectivePermissionsUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
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
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rol: { rolId: 1, nombre: 'admin' },
    } as any);
    mockUserRepository.findRolePermissions.mockResolvedValue([
      { recurso: 'role-perm', accion: 'read' },
    ]);
    mockUserRepository.findDirectPermissions.mockResolvedValue([
      {
        permitido: true,
        recurso: 'extra',
        accion: 'read',
      },
    ]);

    const result = await useCase.execute(1);

    expect(result).toContainEqual({ recurso: 'role-perm', accion: 'read' });
    expect(result).toContainEqual({ recurso: 'extra', accion: 'read' });
  });

  it('should exclude revoked permissions', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rol: { rolId: 1, nombre: 'admin' },
    } as any);
    mockUserRepository.findRolePermissions.mockResolvedValue([
      { recurso: 'role-perm', accion: 'read' },
    ]);
    mockUserRepository.findDirectPermissions.mockResolvedValue([
      {
        permitido: false,
        recurso: 'role-perm',
        accion: 'read',
      },
    ]);

    const result = await useCase.execute(1);

    expect(result).not.toContainEqual({
      recurso: 'role-perm',
      accion: 'read',
    });
  });

  it('should throw EntityNotFoundException if user not found or deleted', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(EntityNotFoundException);
  });
});
