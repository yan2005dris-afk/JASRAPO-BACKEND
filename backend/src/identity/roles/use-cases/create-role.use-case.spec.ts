import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoleUseCase } from './create-role.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    roles: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    rolesHeredados: {
      createMany: jest.fn(),
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

  it('should create a role without children', async () => {
    const dto = { name: 'Admin', description: 'Admin role' };
    mockPrisma.roles.create.mockResolvedValue({ rolesId: 1, ...dto });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ rolesId: 1, ...dto });
    expect(prisma.roles.create).toHaveBeenCalledWith({ data: dto });
    expect(prisma.rolesHeredados.createMany).not.toHaveBeenCalled();
  });

  it('should create a role with children', async () => {
    const dto = { name: 'Manager', childRoleIds: [2, 3] };
    mockPrisma.roles.findMany.mockResolvedValue([{ rolesId: 2 }, { rolesId: 3 }]);
    mockPrisma.roles.create.mockResolvedValue({ rolesId: 1, name: 'Manager' });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ rolesId: 1, name: 'Manager' });
    expect(prisma.rolesHeredados.createMany).toHaveBeenCalledWith({
      data: [
        { parentRoleId: 1, childRoleId: 2 },
        { parentRoleId: 1, childRoleId: 3 },
      ],
    });
  });

  it('should throw NotFoundException if children do not exist', async () => {
    const dto = { name: 'Manager', childRoleIds: [2, 3] };
    mockPrisma.roles.findMany.mockResolvedValue([{ rolesId: 2 }]);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });
});
