import { UserMapper } from './user.mapper';
import { UserEntity } from '../../domain/entities/user.entity';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  const validAvatarKey = 'avatars/1f2a3b4c-5d6e-4f80-9abc-def012345678.webp';

  describe('toEntity', () => {
    it('should return null when the raw record is null', async () => {
      expect(await mapper.toEntity(null)).toBeNull();
    });

    it('should return null when the raw record is undefined', async () => {
      expect(await mapper.toEntity(undefined)).toBeNull();
    });

    it('should map a complete Prisma record to a UserEntity', async () => {
      const raw = {
        usuarioId: 1,
        email: 'user@example.com',
        nombres: 'Juan',
        apellidos: 'Perez',
        telefono: '0991234567',
        avatar: { key: validAvatarKey },
        deletedAt: null,
        rol: { rolId: 2, nombre: 'admin', deletedAt: null },
      };

      const result = await mapper.toEntity(raw);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result!.usuarioId).toBe(1);
      expect(result!.email).toBe('user@example.com');
      expect(result!.nombres).toBe('Juan');
      expect(result!.apellidos).toBe('Perez');
      expect(result!.telefono).toBe('0991234567');
      expect(result!.deletedAt).toBeNull();
      expect(result!.rol).toEqual({
        rolId: 2,
        nombre: 'admin',
        deletedAt: null,
      });
      expect(result!.permisosDirectos).toEqual([]);
      expect(result!.permisosRol).toEqual([]);
    });

    it('should build a storage-proxy URL for a matching avatar key', async () => {
      const result = await mapper.toEntity({
        usuarioId: 1,
        email: 'user@example.com',
        nombres: 'Juan',
        apellidos: 'Perez',
        avatar: { key: validAvatarKey },
      });

      expect(result!.avatar).toEqual({
        url: `/api/v1/storage/profile-photos/avatars--1f2a3b4c-5d6e-4f80-9abc-def012345678.webp`,
        key: validAvatarKey,
      });
    });

    it('should fall back to ui-avatars when the avatar is null', async () => {
      const result = await mapper.toEntity({
        usuarioId: 1,
        email: 'user@example.com',
        nombres: 'Juan',
        apellidos: 'Perez',
        avatar: null,
      });

      expect(result!.avatar!.url).toContain('ui-avatars.com');
      expect(result!.avatar!.url).toContain('Juan%20Perez');
      expect(result!.avatar!.key).toBeUndefined();
    });

    it('should fall back to ui-avatars when the key does not match the avatar pattern', async () => {
      const result = await mapper.toEntity({
        usuarioId: 1,
        email: 'user@example.com',
        nombres: 'Juan',
        apellidos: 'Perez',
        avatar: { key: 'profile-photos/other.png' },
      });

      expect(result!.avatar!.url).toContain('ui-avatars.com');
    });

    it('should map rol as null when the relation is absent', async () => {
      const result = await mapper.toEntity({
        usuarioId: 1,
        email: 'user@example.com',
        nombres: 'Juan',
        apellidos: 'Perez',
        rol: null,
      });

      expect(result!.rol).toBeNull();
    });

    it('should handle missing optional fields', async () => {
      const result = await mapper.toEntity({ usuarioId: 1, email: 'a@b.com' });

      expect(result).toBeInstanceOf(UserEntity);
      expect(result!.nombres).toBeNull();
      expect(result!.apellidos).toBeNull();
      expect(result!.telefono).toBeNull();
      expect(result!.rol).toBeNull();
      expect(result!.avatar!.url).toContain('ui-avatars.com');
      expect(result!.avatar!.url).toContain('User');
    });
  });

  describe('toWithPasswordAndLockout', () => {
    it('should return null when the raw record is null', async () => {
      expect(await mapper.toWithPasswordAndLockout(null)).toBeNull();
    });

    it('should extend the entity with credentials and lockout fields', async () => {
      const base = {
        usuarioId: 1,
        email: 'user@example.com',
        nombres: 'Juan',
        apellidos: 'Perez',
        avatar: null,
      };
      const bloqueadoHasta = new Date();

      const result = await mapper.toWithPasswordAndLockout({
        ...base,
        clave: 'hashed-password',
        intentosFallidos: 2,
        ultimoIntentoFallidoEn: new Date(),
        bloqueadoHasta,
      });

      expect(result).toBeInstanceOf(UserEntity);
      expect(result!.clave).toBe('hashed-password');
      expect(result!.intentosFallidos).toBe(2);
      expect(result!.ultimoIntentoFallidoEn).toEqual(expect.any(Date));
      expect(result!.bloqueadoHasta).toEqual(bloqueadoHasta);
    });
  });
});
