import { Injectable } from '@nestjs/common';
import { UserEntity, UserAvatar } from '../../domain/entities/user.entity';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';
import { STORAGE_PROXY_BASE } from 'src/infrastructure/storage-proxy/storage-proxy.constants';

@Injectable()
export class UserMapper {
  private static readonly AVATAR_KEY_PATTERN =
    /^avatars\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/;

  private async enrichAvatar(
    avatar: unknown,
    fullName: string | null,
  ): Promise<UserAvatar> {
    const avatarObj = avatar as { key?: string } | null;

    if (avatarObj?.key && UserMapper.AVATAR_KEY_PATTERN.test(avatarObj.key)) {
      const safeKey = avatarObj.key.replace(/\//g, '--');
      const url = `${STORAGE_PROXY_BASE}/${SRI_STORAGE_TYPES.PROFILE_PHOTOS}/${safeKey}`;
      return { url, key: avatarObj.key };
    }

    const encodedName = encodeURIComponent(fullName || 'User');
    const defaultUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=256`;

    return { url: defaultUrl };
  }

  async toWithRole(rawUser: any): Promise<UserEntity | null> {
    if (!rawUser) return null;

    const fullName = [rawUser.nombres, rawUser.apellidos]
      .filter(Boolean)
      .join(' ');

    return new UserEntity({
      usuarioId: rawUser.usuarioId,
      email: rawUser.email,
      nombres: rawUser.nombres,
      apellidos: rawUser.apellidos,
      telefono: rawUser.telefono,
      avatar: await this.enrichAvatar(rawUser.avatar, fullName),
      deletedAt: rawUser.deletedAt,
      rol: rawUser.rol
        ? {
            rolId: rawUser.rol.rolId,
            nombre: rawUser.rol.nombre,
            deletedAt: rawUser.rol.deletedAt,
          }
        : null,
    });
  }

  async toWithRoleAndClave(
    rawUser: any,
  ): Promise<(UserEntity & { clave: string }) | null> {
    if (!rawUser) return null;
    const base = await this.toWithRole(rawUser);
    if (!base) return null;
    return Object.assign(base, { clave: rawUser.clave });
  }

  async toWithPasswordAndLockout(rawUser: any): Promise<
    | (UserEntity & {
        clave: string;
        intentosFallidos: number;
        ultimoIntentoFallidoEn: Date | null;
        bloqueadoHasta: Date | null;
      })
    | null
  > {
    if (!rawUser) return null;
    const base = await this.toWithRole(rawUser);
    if (!base) return null;
    return Object.assign(base, {
      clave: rawUser.clave,
      intentosFallidos: rawUser.intentosFallidos,
      ultimoIntentoFallidoEn: rawUser.ultimoIntentoFallidoEn,
      bloqueadoHasta: rawUser.bloqueadoHasta,
    });
  }
}
