import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateUserPermissionsUseCase } from './update-user-permissions.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UpdateUserPermissionsUseCase', () => {
  let useCase: UpdateUserPermissionsUseCase;

  const mockPrisma = {
    usuarios: {
      findUnique: jest.fn(),
    },
    permisos: {
      findMany: jest.fn().mockResolvedValue([]),
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

  it('should throw BadRequestException if any permiso is invalid or soft-deleted', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([]);
    // permisoId 99 no existe o está eliminado — no retornado por permisos.findMany
    mockPrisma.permisos.findMany.mockResolvedValue([{ permisoId: 10 }]);

    await expect(
      useCase.execute(1, [
        { permisoId: 10, permitido: true },
        { permisoId: 99, permitido: true },
      ]),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create new permissions when they do not exist', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([]);
    mockPrisma.permisos.findMany.mockResolvedValue([{ permisoId: 10 }]);

    await useCase.execute(1, [{ permisoId: 10, permitido: true }]);

    // Validar que se verificó que el permiso no está eliminado
    expect(mockPrisma.permisos.findMany).toHaveBeenCalledWith({
      where: {
        permisoId: { in: [10] },
        deletedAt: null,
      },
      select: { permisoId: true },
    });

    expect(mockPrisma.usuarioPermisos.create).toHaveBeenCalledWith({
      data: {
        usuarioId: 1,
        permisoId: 10,
        permitido: true,
      },
    });
  });

  it('should update permitted status if it already exists and is active but status changed', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    // El permiso ya existe y está activo (deletedAt: null) con permitido: true
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      { permisoId: 10, deletedAt: null },
    ]);
    mockPrisma.permisos.findMany.mockResolvedValue([{ permisoId: 10 }]);

    await useCase.execute(1, [{ permisoId: 10, permitido: false }]);

    // Debe actualizar el campo permitido
    expect(mockPrisma.usuarioPermisos.update).toHaveBeenCalledWith({
      where: {
        usuarioId_permisoId: {
          usuarioId: 1,
          permisoId: 10,
        },
      },
      data: {
        permitido: false,
      },
    });
  });

  it('should restore soft-deleted permission', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    // El permiso fue soft-deleted (deletedAt tiene fecha)
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      { permisoId: 10, deletedAt: new Date('2024-01-01') },
    ]);
    mockPrisma.permisos.findMany.mockResolvedValue([{ permisoId: 10 }]);

    await useCase.execute(1, [{ permisoId: 10, permitido: true }]);

    // Debe restaurar el permiso (update con deletedAt: null)
    expect(mockPrisma.usuarioPermisos.update).toHaveBeenCalledWith({
      where: {
        usuarioId_permisoId: {
          usuarioId: 1,
          permisoId: 10,
        },
      },
      data: {
        deletedAt: null,
        permitido: true,
      },
    });
  });

  it('should remove permissions not in the provided list', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    // Permissions are active (deletedAt: null)
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      { permisoId: 1, deletedAt: null },
      { permisoId: 2, deletedAt: null },
      { permisoId: 3, deletedAt: null },
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
    // Permission is active (deletedAt: null)
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      { permisoId: 1, deletedAt: null },
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
