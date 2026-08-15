import { Test } from '@nestjs/testing';
import { Prisma } from 'src/generated/prisma/client';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UserMapper } from '../mappers/user.mapper';
import { UserEntity } from '../../domain/entities/user.entity';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: any;
  let tx: any;
  let userMapper: any;

  const rawUser = {
    usuarioId: 1,
    email: 'user@example.com',
    nombres: 'Juan',
    apellidos: 'Perez',
    telefono: '0991234567',
    avatar: null,
    deletedAt: null,
    rol: { rolId: 1, nombre: 'user', deletedAt: null },
  };

  const mockTx = {
    usuarios: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    usuarioPermisos: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    permisos: {
      findMany: jest.fn(),
    },
  };

  const mockPrisma = {
    usuarios: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    usuarioPermisos: {
      findMany: jest.fn(),
    },
    rolPermisos: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback: (t: any) => Promise<any>) =>
      callback(mockTx),
    ),
  };

  const mockUserMapper = {
    toEntity: jest.fn(),
    toWithPasswordAndLockout: jest.fn(),
  };

  const mockEntity = new UserEntity({ ...rawUser, permisosDirectos: [] });

  beforeEach(async () => {
    jest.clearAllMocks();
    tx = mockTx;

    const module = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UserMapper, useValue: mockUserMapper },
      ],
    }).compile();

    repository = module.get(PrismaUserRepository);
    prisma = mockPrisma;
    userMapper = mockUserMapper;
  });

  describe('create', () => {
    it('should create a user connecting the role and map the result', async () => {
      prisma.usuarios.create.mockResolvedValue(rawUser);
      userMapper.toEntity.mockResolvedValue(mockEntity);

      const result = await repository.create({
        email: 'user@example.com',
        clave: 'hashed',
        nombres: 'Juan',
        apellidos: 'Perez',
        telefono: '0991234567',
        rolId: 1,
      });

      expect(prisma.usuarios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'user@example.com',
            rol: { connect: { rolId: 1 } },
          }),
        }),
      );
      expect(result).toBe(mockEntity);
    });

    it('should include the avatar key as JSON when provided', async () => {
      prisma.usuarios.create.mockResolvedValue(rawUser);
      userMapper.toEntity.mockResolvedValue(mockEntity);

      await repository.create({
        email: 'user@example.com',
        clave: 'hashed',
        nombres: 'Juan',
        apellidos: 'Perez',
        telefono: '0991234567',
        avatar: { key: 'avatars/uuid.webp' },
        rolId: 1,
      });

      expect(prisma.usuarios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            avatar: { key: 'avatars/uuid.webp' },
          }),
        }),
      );
    });

    it('should throw EntityNotFoundException when the mapper returns null', async () => {
      prisma.usuarios.create.mockResolvedValue(rawUser);
      userMapper.toEntity.mockResolvedValue(null);

      await expect(
        repository.create({
          email: 'user@example.com',
          clave: 'hashed',
          nombres: 'Juan',
          apellidos: 'Perez',
          telefono: '0991234567',
          rolId: 1,
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('update', () => {
    it('should update the user and map the result', async () => {
      prisma.usuarios.update.mockResolvedValue({ ...rawUser, nombres: 'Ana' });
      userMapper.toEntity.mockResolvedValue(mockEntity);

      const result = await repository.update(1, { nombres: 'Ana' });

      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId: 1 },
          data: expect.objectContaining({ nombres: 'Ana' }),
        }),
      );
      expect(result).toBe(mockEntity);
    });

    it('should throw EntityNotFoundException when the mapper returns null', async () => {
      prisma.usuarios.update.mockResolvedValue(rawUser);
      userMapper.toEntity.mockResolvedValue(null);

      await expect(repository.update(999, { nombres: 'Ana' })).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('should translate Prisma P2025 to EntityNotFoundException', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '7.6.0' },
      );
      prisma.usuarios.update.mockRejectedValue(p2025);

      await expect(
        repository.update(999, { deletedAt: new Date() }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should rethrow non-P2025 errors unchanged', async () => {
      const dbError = new Error('Connection refused');
      prisma.usuarios.update.mockRejectedValue(dbError);

      await expect(repository.update(1, { nombres: 'Ana' })).rejects.toThrow(
        'Connection refused',
      );
    });
  });

  describe('recordFailedLoginAttempt', () => {
    const options = {
      windowMs: 60_000,
      threshold: 5,
      lockoutDurationMs: 600_000,
    };

    it('should reset the counter to 1 when the last attempt is outside the window', async () => {
      tx.usuarios.findUnique.mockResolvedValue({
        intentosFallidos: 3,
        ultimoIntentoFallidoEn: new Date(Date.now() - options.windowMs - 1000),
        bloqueadoHasta: null,
      });
      const updated = { intentosFallidos: 1, bloqueadoHasta: null };
      tx.usuarios.update.mockResolvedValue(updated);

      const result = await repository.recordFailedLoginAttempt(1, options);

      expect(tx.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId: 1 },
          data: expect.objectContaining({
            intentosFallidos: 1,
            ultimoIntentoFallidoEn: expect.any(Date),
            bloqueadoHasta: null,
          }),
        }),
      );
      expect(result).toEqual(updated);
    });

    it('should increment the counter when the last attempt is inside the window', async () => {
      tx.usuarios.findUnique.mockResolvedValue({
        intentosFallidos: 1,
        ultimoIntentoFallidoEn: new Date(),
        bloqueadoHasta: null,
      });
      tx.usuarios.update.mockResolvedValue({
        intentosFallidos: 2,
        bloqueadoHasta: null,
      });

      await repository.recordFailedLoginAttempt(1, options);

      expect(tx.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ intentosFallidos: 2 }),
        }),
      );
    });

    it('should trigger lockout when the counter reaches the threshold', async () => {
      tx.usuarios.findUnique.mockResolvedValue({
        intentosFallidos: options.threshold - 1,
        ultimoIntentoFallidoEn: new Date(),
        bloqueadoHasta: null,
      });
      const updated = {
        intentosFallidos: 0,
        bloqueadoHasta: new Date(Date.now() + options.lockoutDurationMs),
      };
      tx.usuarios.update.mockResolvedValue(updated);

      const result = await repository.recordFailedLoginAttempt(1, options);

      expect(tx.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            intentosFallidos: 0,
            bloqueadoHasta: expect.any(Date),
          }),
        }),
      );
      expect(result).toEqual(updated);
    });

    it('should clear an expired bloqueadoHasta when the counter is below the threshold', async () => {
      tx.usuarios.findUnique.mockResolvedValue({
        intentosFallidos: 1,
        ultimoIntentoFallidoEn: new Date(),
        bloqueadoHasta: new Date(Date.now() - 1000),
      });
      tx.usuarios.update.mockResolvedValue({
        intentosFallidos: 2,
        bloqueadoHasta: null,
      });

      await repository.recordFailedLoginAttempt(1, options);

      expect(tx.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ bloqueadoHasta: null }),
        }),
      );
    });

    it('should throw EntityNotFoundException when the user does not exist', async () => {
      tx.usuarios.findUnique.mockResolvedValue(null);

      await expect(
        repository.recordFailedLoginAttempt(999, options),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('updatePermissions', () => {
    it('should deduplicate by permisoId with last value winning', async () => {
      prisma.usuarioPermisos.findMany.mockResolvedValue([
        { permisoId: 1, deletedAt: null, permitido: true },
      ]);
      tx.permisos.findMany.mockResolvedValue([{ permisoId: 1 }]);

      await repository.updatePermissions(1, [
        { permisoId: 1, permitido: true },
        { permisoId: 1, permitido: false },
      ]);

      expect(tx.usuarioPermisos.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ permitido: false }),
        }),
      );
      expect(tx.usuarioPermisos.update).toHaveBeenCalledTimes(1);
    });

    it('should soft-delete permissions that are no longer present', async () => {
      prisma.usuarioPermisos.findMany.mockResolvedValue([
        { permisoId: 1, deletedAt: null, permitido: true },
        { permisoId: 2, deletedAt: null, permitido: true },
      ]);
      tx.permisos.findMany.mockResolvedValue([{ permisoId: 1 }]);

      await repository.updatePermissions(1, [{ permisoId: 1 }]);

      expect(tx.usuarioPermisos.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            usuarioId: 1,
            permisoId: { in: [2] },
            deletedAt: null,
          },
          data: { deletedAt: expect.any(Date) },
        }),
      );
    });

    it('should soft-restore a previously deleted permission', async () => {
      prisma.usuarioPermisos.findMany.mockResolvedValue([
        { permisoId: 1, deletedAt: new Date(), permitido: false },
      ]);
      tx.permisos.findMany.mockResolvedValue([{ permisoId: 1 }]);

      await repository.updatePermissions(1, [
        { permisoId: 1, permitido: true },
      ]);

      expect(tx.usuarioPermisos.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            usuarioId_permisoId: { usuarioId: 1, permisoId: 1 },
          },
          data: expect.objectContaining({
            deletedAt: null,
            permitido: true,
          }),
        }),
      );
    });

    it('should create a new permission relation when none exists', async () => {
      prisma.usuarioPermisos.findMany.mockResolvedValue([]);
      tx.permisos.findMany.mockResolvedValue([{ permisoId: 5 }]);

      await repository.updatePermissions(1, [
        { permisoId: 5, permitido: false },
      ]);

      expect(tx.usuarioPermisos.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 1,
          permisoId: 5,
          permitido: false,
        },
      });
    });

    it('should only update when permitido changed', async () => {
      prisma.usuarioPermisos.findMany.mockResolvedValue([
        { permisoId: 1, deletedAt: null, permitido: true },
      ]);
      tx.permisos.findMany.mockResolvedValue([{ permisoId: 1 }]);

      await repository.updatePermissions(1, [{ permisoId: 1 }]);

      expect(tx.usuarioPermisos.update).not.toHaveBeenCalled();

      await repository.updatePermissions(1, [
        { permisoId: 1, permitido: false },
      ]);

      expect(tx.usuarioPermisos.update).toHaveBeenCalledTimes(1);
    });

    it('should throw EntityNotFoundException when a permisoId is not valid', async () => {
      prisma.usuarioPermisos.findMany.mockResolvedValue([]);
      tx.permisos.findMany.mockResolvedValue([]);

      await expect(
        repository.updatePermissions(1, [{ permisoId: 999 }]),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should run inside a transaction when no tx is provided', async () => {
      prisma.usuarioPermisos.findMany.mockResolvedValue([]);
      tx.permisos.findMany.mockResolvedValue([]);

      await repository.updatePermissions(1, []);

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('findManyActive', () => {
    it('should paginate active users and map each row', async () => {
      prisma.usuarios.count.mockResolvedValue(1);
      prisma.usuarios.findMany.mockResolvedValue([rawUser]);
      userMapper.toEntity.mockResolvedValue(mockEntity);

      const result = await repository.findManyActive({ page: 1, limit: 10 });

      expect(prisma.usuarios.count).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(result.data).toEqual([mockEntity]);
      expect(result.meta).toEqual(
        expect.objectContaining({ total: 1, page: 1, limit: 10 }),
      );
    });

    it('should filter out null mappings', async () => {
      prisma.usuarios.count.mockResolvedValue(2);
      prisma.usuarios.findMany.mockResolvedValue([
        rawUser,
        { ...rawUser, usuarioId: 2 },
      ]);
      userMapper.toEntity
        .mockResolvedValueOnce(mockEntity)
        .mockResolvedValueOnce(null);

      const result = await repository.findManyActive({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockEntity]);
    });
  });
});
