import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateRoleUseCase } from './create-role.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    roles: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
    $queryRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should create a role without children (flat roles model)', async () => {
    const dto = { name: 'Admin', description: 'Admin role' };
    mockPrisma.roles.create.mockResolvedValue({ rolesId: 1, ...dto });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ rolesId: 1, ...dto });
    expect(prisma.roles.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should create a role with only name (no hierarchy)', async () => {
    const dto = { name: 'Operador' };
    mockPrisma.roles.create.mockResolvedValue({ rolesId: 5, name: 'Operador' });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ rolesId: 5, name: 'Operador' });
    expect(prisma.roles.create).toHaveBeenCalledWith({ data: dto });
  });
});
