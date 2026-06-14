import { Injectable, Logger } from '@nestjs/common';
import type {
  UserWithRoleResponse,
  AvatarResponse,
} from '../../domain/types/user.types';
import {
  StorageService,
  SRI_BUCKETS,
} from 'src/infrastructure/storage/storage.service';

@Injectable()
export class UserMapper {
  private readonly logger = new Logger(UserMapper.name);

  constructor(private readonly storageService: StorageService) {}

  /**
   * Enriquece los datos del avatar con una URL dinámica o una de fallback.
   */
  private async enrichAvatar(
    avatar: unknown,
    fullName: string | null,
  ): Promise<AvatarResponse> {
    const avatarObj = avatar as { key?: string } | null;

    if (avatarObj?.key) {
      try {
        const url = await this.storageService.getUrl(
          SRI_BUCKETS.PROFILE_PHOTOS,
          avatarObj.key,
        );
        return { url, key: avatarObj.key };
      } catch (error) {
        this.logger.error(
          `Error al generar URL firmada para avatar (key: ${avatarObj.key}): ${error.message}`,
          error.stack,
        );
      }
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
