import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetUserDirectPermissionsUseCase } from './get-user-direct-permissions.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GetUserDirectPermissionsUseCase', () => {
  let useCase: GetUserDirectPermissionsUseCase;

  const mockPrisma = {
    usuarios: {
      findUnique: jest.fn(),
    },
    usuarioPermisos: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserDirectPermissionsUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<GetUserDirectPermissionsUseCase>(
      GetUserDirectPermissionsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return direct permissions for a user', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      {
        usuarioPermisoId: 1,
        permisoId: 10,
        permiso: { recurso: 'users', accion: 'read' },
        permitido: true,
      },
      {
        usuarioPermisoId: 2,
        permisoId: 20,
        permiso: { recurso: 'users', accion: 'write' },
        permitido: false,
      },
    ]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      usuarioPermisoId: 1,
      permisoId: 10,
      recurso: 'users',
      accion: 'read',
      permitido: true,
    });
    expect(result[1]).toEqual({
      usuarioPermisoId: 2,
      permisoId: 20,
      recurso: 'users',
      accion: 'write',
      permitido: false,
    });
  });

  it('should return empty array if user has no direct permissions', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([]);

    const result = await useCase.execute(1);

    expect(result).toEqual([]);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if user is deleted', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(1)).toThrow(NotFoundException);
  });

  it('should order by resource and action', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
    });
    mockPrisma.usuarioPermisos.findMany.mockResolvedValue([
      {
        usuarioPermisoId: 1,
        permisoId: 1,
        permiso: { recurso: 'zebra', accion: 'read' },
        permitido: true,
      },
      {
        usuarioPermisoId: 2,
        permisoId: 2,
        permiso: { recurso: 'alpha', accion: 'write' },
        permitido: true,
      },
      {
        usuarioPermisoId: 3,
        permisoId: 3,
        permiso: { recurso: 'beta', accion: 'delete' },
        permitido: true,
      },
    ]);

    const result = await useCase.execute(1);

    expect(result[0].recurso).toBe('alpha');
    expect(result[1].recurso).toBe('beta');
    expect(result[2].recurso).toBe('zebra');
  });
});
