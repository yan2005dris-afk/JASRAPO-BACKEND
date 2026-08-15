import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findRoleById: jest.fn(),
    findRoleByName: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
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
    mockUserRepository.findRoleByName.mockResolvedValue({
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
    expect(mockUserRepository.findRoleByName).toHaveBeenCalledWith('user');
  });

  it('should fail if default user role is soft-deleted', async () => {
    const dto = {
      email: 'test@example.com',
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '0991234567',
    };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findRoleByName.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(
      'No existe el rol por defecto "user".',
    );
    expect(mockUserRepository.findRoleByName).toHaveBeenCalledWith('user');
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
    mockUserRepository.findRoleById.mockResolvedValue({
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
    expect(mockUserRepository.findRoleById).toHaveBeenCalledWith(2);
  });

  it('should throw NotFoundException if provided rolId does not exist', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findRoleById.mockResolvedValue(null);
    await expect(
      useCase.execute({
        email: 't@t.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '0991234567',
        rolId: 999,
      }),
    ).rejects.toThrow('Rol no encontrado o eliminado');
  });

  it('should throw BadRequestException for invalid Ecuador phone', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({
        email: 't@t.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '+5491155555555',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for empty nombres', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({
        email: 't@t.com',
        nombres: '',
        apellidos: 'User',
        telefono: '0991234567',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException if email already exists (active)', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      usuarioId: 1,
      email: 't@t.com',
      deletedAt: null,
    });
    await expect(
      useCase.execute({
        email: 't@t.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '0991234567',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException with specific message if email exists but deleted', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      usuarioId: 1,
      email: 't@t.com',
      deletedAt: new Date('2024-01-01'),
    });
    await expect(
      useCase.execute({
        email: 't@t.com',
        nombres: 'Test',
        apellidos: 'User',
        telefono: '0991234567',
      }),
    ).rejects.toThrow('pertenece a un usuario eliminado');
  });
});
