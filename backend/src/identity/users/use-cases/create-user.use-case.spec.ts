import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    roles: {
      findFirst: jest.fn(),
    },
    usuarios: {
      create: jest.fn(),
    },
    perfiles: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create user with profile', async () => {
    mockPrisma.roles.findFirst.mockResolvedValue({ rolId: 1, nombre: 'user' });
    mockPrisma.usuarios.create.mockResolvedValue({
      usuarioId: 1,
      email: 'test@example.com',
    });
    mockPrisma.perfiles.create.mockResolvedValue({});

    const result = await useCase.execute({
      email: 'test@example.com',
      clave: 'password123',
    });

    expect(result).toEqual({ usuarioId: 1, email: 'test@example.com' });
    expect(mockPrisma.roles.findFirst).toHaveBeenCalledWith({
      where: { nombre: 'user' },
    });
    expect(mockPrisma.usuarios.create).toHaveBeenCalled();
    expect(mockPrisma.perfiles.create).toHaveBeenCalledWith({
      data: { usuarioId: 1 },
    });
  });

  it('should hash the password', async () => {
    mockPrisma.roles.findFirst.mockResolvedValue({ rolId: 1, nombre: 'user' });
    mockPrisma.usuarios.create.mockResolvedValue({
      usuarioId: 1,
      email: 'test@example.com',
    });

    await useCase.execute({
      email: 'test@example.com',
      clave: 'password123',
    });

    const createCall = mockPrisma.usuarios.create.mock.calls[0][0];
    const isMatch = await bcrypt.compare('password123', createCall.data.clave);
    expect(isMatch).toBe(true);
  });

  it('should throw error if default role "user" not found', async () => {
    mockPrisma.roles.findFirst.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        clave: 'password123',
      }),
    ).rejects.toThrow('No existe el rol por defecto "user".');
  });
});
