import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetUserRolePermissionsUseCase } from './get-user-role-permissions.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('GetUserRolePermissionsUseCase', () => {
  let useCase: GetUserRolePermissionsUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    findRolePermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserRolePermissionsUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<GetUserRolePermissionsUseCase>(
      GetUserRolePermissionsUseCase,
    );
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return role permissions for a user with active role', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rol: { rolId: 1, nombre: 'admin' },
    } as any);
    mockUserRepository.findRolePermissions.mockResolvedValue([
      { recurso: 'users', accion: 'read' },
      { recurso: 'users', accion: 'write' },
      { recurso: 'reports', accion: 'export' },
    ]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ recurso: 'users', accion: 'read' });
    expect(result).toContainEqual({ recurso: 'users', accion: 'write' });
    expect(result).toContainEqual({ recurso: 'reports', accion: 'export' });
  });

  it('should return empty array if user has no role', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rol: null,
    } as any);

    const result = await useCase.execute(1);

    expect(result).toEqual([]);
    expect(mockUserRepository.findRolePermissions).not.toHaveBeenCalled();
  });

  it('should throw EntityNotFoundException if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException if user is deleted', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(1)).rejects.toThrow(EntityNotFoundException);
  });
});
