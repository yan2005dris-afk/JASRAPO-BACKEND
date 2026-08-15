import type { Prisma } from 'src/generated/prisma/client';
import {
  UserEntity,
  UserDetailEntity,
  UserProfileEntity,
  AvatarEntity,
  AuthPermissionEntity,
  DirectPermissionEntity,
} from '../entities/user.entity';

// ============================================
// Safe Prisma Selects
// ============================================

export const safeUserSelect = {
  usuarioId: true,
  email: true,
  nombres: true,
  apellidos: true,
  telefono: true,
  avatar: true,
} satisfies Prisma.UsuariosSelect;

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
} satisfies Prisma.UsuariosSelect;

/**
 * Select usado por el flujo de login: incluye el hash de la clave y los
 * contadores de protección contra fuerza bruta (issue #136).
 */
export const userWithPasswordAndLockoutSelect = {
  ...userWithRolesSelect,
  clave: true,
  intentosFallidos: true,
  ultimoIntentoFallidoEn: true,
  bloqueadoHasta: true,
} satisfies Prisma.UsuariosSelect;

// ============================================
// Frontend Response Types (Single Source of Truth: Domain Entities)
// ============================================

export type AvatarResponse = AvatarEntity;
export type UserResponse = UserEntity;
export type UserWithRoleResponse = UserEntity;
export type UserWithPermissionsResponse = UserDetailEntity;
export type ProfileResponse = UserProfileEntity;

export type DirectPermissionResponse = DirectPermissionEntity;
export type AuthPermissionResponse = AuthPermissionEntity;
export type RolePermissionResponse = AuthPermissionEntity;

export interface EffectivePermissionsResponse {
  usuarioId: number;
  permisos: AuthPermissionEntity[];
}


