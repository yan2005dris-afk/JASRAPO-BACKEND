import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetEffectivePermissionsUseCase } from './get-effective-permissions.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GetEffectivePermissionsUseCase', () => {
  let useCase: GetEffectivePermissionsUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    usuarios: {
      findUnique: jest.fn(),
    },
    rolPermisos: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEffectivePermissionsUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<GetEffectivePermissionsUseCase>(
      GetEffectivePermissionsUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should combine role and direct permissions', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rol: { rolId: 1, deletedAt: null },
      permisosUsuario: [
        {
          permitido: true,
          permiso: { recurso: 'extra', accion: 'read', deletedAt: null },
        },
      ],
    });
    mockPrisma.rolPermisos.findMany.mockResolvedValue([
      { permiso: { recurso: 'role-perm', accion: 'read' } },
    ]);

    const result = await useCase.execute(1);

    expect(result).toContainEqual({ resource: 'role-perm', action: 'read' });
    expect(result).toContainEqual({ resource: 'extra', action: 'read' });
  });

  it('should exclude revoked permissions', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      deletedAt: null,
      rol: { rolId: 1, deletedAt: null },
      permisosUsuario: [
        {
          permitido: false,
          permiso: {
            recurso: 'role-perm',
            accion: 'read',
            deletedAt: null,
          },
        },
      ],
    });
    mockPrisma.rolPermisos.findMany.mockResolvedValue([
      { permiso: { recurso: 'role-perm', accion: 'read' } },
    ]);

    const result = await useCase.execute(1);

    expect(result).not.toContainEqual({
      resource: 'role-perm',
      action: 'read',
    });
  });

  it('should throw NotFoundException if user not found or deleted', async () => {
    mockPrisma.usuarios.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
