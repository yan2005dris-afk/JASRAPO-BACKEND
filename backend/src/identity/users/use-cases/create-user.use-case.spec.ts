import { Test, TestingModule } from '@nestjs/testing';
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
    users: {
      create: jest.fn(),
    },
    profiles: {
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
    mockPrisma.roles.findFirst.mockResolvedValue({ rolesId: 1, name: 'user' });
    mockPrisma.users.create.mockResolvedValue({ usersId: 1, email: 'test@example.com' });
    mockPrisma.profiles.create.mockResolvedValue({});

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({ usersId: 1, email: 'test@example.com' });
    expect(mockPrisma.roles.findFirst).toHaveBeenCalledWith({ where: { name: 'user' } });
    expect(mockPrisma.users.create).toHaveBeenCalled();
    expect(mockPrisma.profiles.create).toHaveBeenCalledWith({ data: { usersId: 1 } });
  });

  it('should hash the password', async () => {
    mockPrisma.roles.findFirst.mockResolvedValue({ rolesId: 1, name: 'user' });
    mockPrisma.users.create.mockResolvedValue({ usersId: 1, email: 'test@example.com' });

    await useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    const createCall = mockPrisma.users.create.mock.calls[0][0];
    const isMatch = await bcrypt.compare('password123', createCall.data.password);
    expect(isMatch).toBe(true);
  });

  it('should throw error if default role "user" not found', async () => {
    mockPrisma.roles.findFirst.mockResolvedValue(null);

    await expect(useCase.execute({
      email: 'test@example.com',
      password: 'password123',
    })).rejects.toThrow('No existe el rol por defecto "user".');
  });
});
