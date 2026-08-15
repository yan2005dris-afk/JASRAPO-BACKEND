import {
  UserEntity,
  UserDetailEntity,
  UserProfileEntity,
  AvatarEntity,
  AuthPermissionEntity,
  DirectPermissionEntity,
} from '../entities/user.entity';

// ============================================
// Response Types (Single Source of Truth: Domain Entities)
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
