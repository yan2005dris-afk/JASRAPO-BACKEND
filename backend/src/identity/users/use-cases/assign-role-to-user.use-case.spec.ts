import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AssignRoleToUserUseCase } from './assign-role-to-user.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('AssignRoleToUserUseCase', () => {
  let useCase: AssignRoleToUserUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    usuarios: {
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
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rolId: 2,
    });
    mockPrisma.roles.findUnique.mockResolvedValue({
      rolId: 3,
      deletedAt: null,
    });
    mockPrisma.usuarios.update.mockResolvedValue({ usuarioId: 1, rolId: 3 });

    const result = await useCase.execute(1, 3);

    expect(result.rolId).toBe(3);
    expect(mockPrisma.usuarios.update).toHaveBeenCalledWith({
      where: { usuarioId: 1 },
      data: { rolId: 3 },
    });
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1, 3)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if role not found', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.roles.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1, 3)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if user already has the role', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rolId: 3,
    });
    mockPrisma.roles.findUnique.mockResolvedValue({
      rolId: 3,
      deletedAt: null,
    });

    await expect(useCase.execute(1, 3)).rejects.toThrow(ConflictException);
  });
});
