import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AssignPermissionToUserUseCase } from './assign-permission-to-user.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AssignPermissionToUserUseCase', () => {
  let useCase: AssignPermissionToUserUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    usuarios: {
      findUnique: jest.fn(),
    },
    permisos: {
      findUnique: jest.fn(),
    },
    usuarioPermisos: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignPermissionToUserUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<AssignPermissionToUserUseCase>(
      AssignPermissionToUserUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create new permission assignment if not exists', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.permisos.findUnique.mockResolvedValue({
      permisoId: 2,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findFirst.mockResolvedValue(null);
    mockPrisma.usuarioPermisos.create.mockResolvedValue({
      usuarioPermisoId: 10,
    });

    const result = await useCase.execute(1, 2, true);

    expect(result.usuarioPermisoId).toBe(10);
    expect(mockPrisma.usuarioPermisos.create).toHaveBeenCalledWith({
      data: { usuarioId: 1, permisoId: 2, permitido: true },
    });
  });

  it('should update existing permission assignment', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.permisos.findUnique.mockResolvedValue({
      permisoId: 2,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findFirst.mockResolvedValue({
      usuarioPermisoId: 10,
      permitido: false,
    });
    mockPrisma.usuarioPermisos.update.mockResolvedValue({
      usuarioPermisoId: 10,
      permitido: true,
    });

    const result = await useCase.execute(1, 2, true);

    expect(result.permitido).toBe(true);
    expect(mockPrisma.usuarioPermisos.update).toHaveBeenCalledWith({
      where: { usuarioPermisoId: 10 },
      data: { permitido: true },
    });
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1, 2)).rejects.toThrow(NotFoundException);
  });
});
