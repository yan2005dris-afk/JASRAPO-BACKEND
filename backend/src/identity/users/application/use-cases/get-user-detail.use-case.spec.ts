import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetUserDetailUseCase } from './get-user-detail.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { userRow } from '../../__test-utils__/user-row.factory';

describe('GetUserDetailUseCase', () => {
  let useCase: GetUserDetailUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findDirectPermissions: jest.fn(),
    findRolePermissions: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserDetailUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<GetUserDetailUseCase>(GetUserDetailUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should return the user with direct and role permissions when found by usuarioId', async () => {
    const user = userRow({
      usuarioId: 1,
      email: 'user@example.com',
      nombres: 'Juan',
      apellidos: 'Perez',
      deletedAt: null,
      rol: { rolId: 1, nombre: 'user', deletedAt: null },
    });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findDirectPermissions.mockResolvedValue([
      {
        usuarioPermisoId: 10,
        permisoId: 5,
        recurso: 'users',
        accion: 'read',
        permitido: true,
      },
    ]);
    mockUserRepository.findRolePermissions.mockResolvedValue([
      { recurso: 'billing', accion: 'read' },
    ]);

    const result = await useCase.execute({ usuarioId: 1 });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    expect(result!.permisosDirectos).toEqual([
      {
        usuarioPermisoId: 10,
        permisoId: 5,
        recurso: 'users',
        accion: 'read',
        permitido: true,
      },
    ]);
    expect(result!.permisosRol).toEqual([
      { recurso: 'billing', accion: 'read' },
    ]);
  });

  it('should return null when the user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({ usuarioId: 999 });

    expect(result).toBeNull();
  });

  it('should return null when the user is soft-deleted', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: new Date(),
    } as any);

    const result = await useCase.execute({ usuarioId: 1 });

    expect(result).toBeNull();
  });

  it('should look up by email when email criteria is provided', async () => {
    const user = userRow({
      usuarioId: 1,
      email: 'user@example.com',
      deletedAt: null,
      rol: null,
    });
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockUserRepository.findDirectPermissions.mockResolvedValue([]);

    const result = await useCase.execute({ email: 'user@example.com' });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      'user@example.com',
    );
    expect(result!.usuarioId).toBe(1);
  });

  it('should return null when no criteria is provided', async () => {
    const result = await useCase.execute({});

    expect(result).toBeNull();
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should not load role permissions when the role is soft-deleted', async () => {
    const user = userRow({
      usuarioId: 1,
      email: 'user@example.com',
      deletedAt: null,
      rol: { rolId: 1, nombre: 'user', deletedAt: new Date() },
    });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findDirectPermissions.mockResolvedValue([]);

    const result = await useCase.execute({ usuarioId: 1 });

    expect(mockUserRepository.findRolePermissions).not.toHaveBeenCalled();
    expect(result!.permisosRol).toEqual([]);
  });
});
