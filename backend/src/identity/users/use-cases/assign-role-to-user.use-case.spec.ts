import { Test, TestingModule } from '@nestjs/testing';
import { AssignRoleToUserUseCase } from './assign-role-to-user.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('AssignRoleToUserUseCase', () => {
  let useCase: AssignRoleToUserUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    users: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    roles: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRoleToUserUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<AssignRoleToUserUseCase>(AssignRoleToUserUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should assign role to user', async () => {
    mockPrisma.users.findUnique.mockResolvedValue({ usersId: 1, deletedAt: null, rolesId: 2 });
    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId: 3, deletedAt: null });
    mockPrisma.users.update.mockResolvedValue({ usersId: 1, rolesId: 3 });

    const result = await useCase.execute(1, 3);

    expect(result.rolesId).toBe(3);
    expect(mockPrisma.users.update).toHaveBeenCalledWith({
      where: { usersId: 1 },
      data: { rolesId: 3 },
    });
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1, 3)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if role not found', async () => {
    mockPrisma.users.findUnique.mockResolvedValue({ usersId: 1, deletedAt: null });
    mockPrisma.roles.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1, 3)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if user already has the role', async () => {
    mockPrisma.users.findUnique.mockResolvedValue({ usersId: 1, deletedAt: null, rolesId: 3 });
    mockPrisma.roles.findUnique.mockResolvedValue({ rolesId: 3, deletedAt: null });

    await expect(useCase.execute(1, 3)).rejects.toThrow(ConflictException);
  });
});
