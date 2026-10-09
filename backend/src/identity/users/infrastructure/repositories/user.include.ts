import type { Prisma } from 'src/generated/prisma/client';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';
import { STORAGE_PROXY_BASE } from 'src/infrastructure/storage-proxy/storage-proxy.constants';
import type { UserAvatar } from '../../domain/types/user.types';

export const userWithRolesSelect = {
  usuarioId: true,
  email: true,
  nombres: true,
  apellidos: true,
  telefono: true,
  avatar: true,
  deletedAt: true,
  rol: {
    select: {
      rolId: true,
      nombre: true,
      deletedAt: true,
    },
  },
} as const satisfies Prisma.UsuariosSelect;

export const userWithPasswordAndLockoutSelect = {
  ...userWithRolesSelect,
  clave: true,
  intentosFallidos: true,
  ultimoIntentoFallidoEn: true,
  bloqueadoHasta: true,
} as const satisfies Prisma.UsuariosSelect;

export type UserRow = Prisma.UsuariosGetPayload<{
  select: typeof userWithRolesSelect;
}>;

export type UserWithPasswordAndLockoutRow = Prisma.UsuariosGetPayload<{
  select: typeof userWithPasswordAndLockoutSelect;
}>;

const AVATAR_KEY_PATTERN =
  /^avatars\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/;

export function resolveUserAvatar(
  avatar: unknown,
  fullName?: string | null,
): UserAvatar {
  const avatarObj = avatar as { key?: string } | null;

  if (avatarObj?.key && AVATAR_KEY_PATTERN.test(avatarObj.key)) {
    const safeKey = avatarObj.key.replace(/\//g, '--');
    const url = `${STORAGE_PROXY_BASE}/${SRI_STORAGE_TYPES.PROFILE_PHOTOS}/${safeKey}`;
    return { url, key: avatarObj.key };
  }

  const encodedName = encodeURIComponent(fullName || 'User');
  const defaultUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=256`;

  return { url: defaultUrl };
}
