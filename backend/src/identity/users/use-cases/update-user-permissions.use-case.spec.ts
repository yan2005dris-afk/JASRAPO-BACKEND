import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateUserPermissionsUseCase } from './update-user-permissions.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UpdateUserPermissionsUseCase', () => {
  let useCase: UpdateUserPermissionsUseCase;

  const mockPrisma = {
    usuarios: {
      findUnique: jest.fn(),
    },
    usuarioPermisos: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockTransaction = jest.fn().mockImplementation((callback) => {
    return callback(mockPrisma);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.usuarioPermisos.findMany.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserPermissionsUseCase,
        {
          provide: PrismaService,
          useValue: {
            ...mockPrisma,
            $transaction: mockTransaction,
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserPermissionsUseCase>(
      UpdateUserPermissionsUseCase,
    );
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute(1, [{ permisoId: 1, permitido: true }]),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if user is deleted', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: new Date(),
    });

    await expect(
      useCase.execute(1, [{ permisoId: 1, permitido: true }]),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create new permissions when they do not exist', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([]);

    await useCase.execute(1, [{ permisoId: 10, permitido: true }]);

    expect(mockPrisma.usuarioPermisos.create).toHaveBeenCalledWith({
      data: {
        usuarioId: 1,
        permisoId: 10,
        permitido: true,
      },
    });
  });

  it('should update existing permission if it already exists', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      { permisoId: 10 },
    ]);
    mockPrisma.usuarioPermisos.findFirst.mockResolvedValue({
      usuarioPermisoId: 1,
      permisoId: 10,
      permitido: true,
    });

    await useCase.execute(1, [{ permisoId: 10, permitido: false }]);

    expect(mockPrisma.usuarioPermisos.update).toHaveBeenCalledWith({
      where: { usuarioPermisoId: 1 },
      data: { permitido: false },
    });
  });

  it('should remove permissions not in the provided list', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      { permisoId: 1 },
      { permisoId: 2 },
      { permisoId: 3 },
    ]);

    await useCase.execute(1, [{ permisoId: 1, permitido: true }]);

    expect(mockPrisma.usuarioPermisos.updateMany).toHaveBeenCalledWith({
      where: {
        usuarioId: 1,
        permisoId: { in: [2, 3] },
        deletedAt: null,
      },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should handle empty permissions array', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      { permisoId: 1 },
    ]);

    await useCase.execute(1, []);

    expect(mockPrisma.usuarioPermisos.updateMany).toHaveBeenCalledWith({
      where: {
        usuarioId: 1,
        permisoId: { in: [1] },
        deletedAt: null,
      },
      data: { deletedAt: expect.any(Date) },
    });
  });
});