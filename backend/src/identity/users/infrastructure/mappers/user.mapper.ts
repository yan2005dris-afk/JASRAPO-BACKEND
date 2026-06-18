import { Injectable } from '@nestjs/common';
import type {
  UserWithRoleResponse,
  AvatarResponse,
} from '../../domain/types/user.types';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';
import { STORAGE_PROXY_BASE } from 'src/infrastructure/storage-proxy/storage-proxy.constants';

@Injectable()
export class UserMapper {
  /**
   * Enriquece los datos del avatar con una URL estable hacia el proxy de imágenes
   * o una de fallback si no hay avatar.
   *
   * La URL generada apunta al StorageProxyController que sirve la imagen directamente
   * desde S3 con cabeceras de caché HTTP. Esto permite:
   * - Cacheo en navegador (Cache-Control: max-age=31536000)
   * - Cacheo en Nginx (proxy_cache)
   * - URLs estables que no expiran (a diferencia de presigned URLs)
   */
  /**
   * Formato que debe tener un key de avatar válido generado por
   * `uploadAndProcessAvatar()` en UserService.
   *
   * Ejemplo: `avatars/550e8400-e29b-41d4-a716-446655440000.webp`
   *
   * Los keys que no cumplan este patrón (ej: legacy data, keys manuales)
   * se consideran inválidos y se usa el fallback a ui-avatars.com.
   */
  private static readonly AVATAR_KEY_PATTERN =
    /^avatars\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/;

  private async enrichAvatar(
    avatar: unknown,
    fullName: string | null,
  ): Promise<AvatarResponse> {
    const avatarObj = avatar as { key?: string } | null;

    if (avatarObj?.key && UserMapper.AVATAR_KEY_PATTERN.test(avatarObj.key)) {
      // Replace '/' with '--' for URL safety — the controller reverts it
      const safeKey = avatarObj.key.replace(/\//g, '--');
      const url = `${STORAGE_PROXY_BASE}/${SRI_STORAGE_TYPES.PROFILE_PHOTOS}/${safeKey}`;
      return { url, key: avatarObj.key };
    }

    // Avatar por defecto (Fallback) basado en el nombre
    const encodedName = encodeURIComponent(fullName || 'User');
    const defaultUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=256`;

    return { url: defaultUrl };
  }

  async toWithRole(rawUser: any): Promise<UserWithRoleResponse | null> {
    if (!rawUser) return null;

    const fullName = [rawUser.nombres, rawUser.apellidos]
      .filter(Boolean)
      .join(' ');

    return {
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
    };
  }

  async toWithRoleAndClave(
    rawUser: any,
  ): Promise<(UserWithRoleResponse & { clave: string }) | null> {
    if (!rawUser) return null;
    const base = await this.toWithRole(rawUser);
    if (!base) return null;
    return {
      ...base,
      clave: rawUser.clave,
    };
  }
}
