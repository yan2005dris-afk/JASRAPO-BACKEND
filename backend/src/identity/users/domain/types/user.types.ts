// ============================================
// Frontend Response Types
// ============================================

export interface AvatarResponse {
  url: string;
  key?: string;
}

export interface UserResponse {
  usuarioId: number;
  email: string;
  nombres: string | null;
  apellidos: string | null;
  telefono: string | null;
  avatar: AvatarResponse | null;
}

export interface UserWithRoleResponse extends UserResponse {
  rol: {
    rolId: number;
    nombre: string;
    deletedAt?: Date | null;
  } | null;
  deletedAt?: Date | null;
}

export interface UserWithPermissionsResponse extends UserWithRoleResponse {
  permisosDirectos: DirectPermissionResponse[];
  permisosRol: AuthPermissionResponse[];
}

export interface DirectPermissionResponse {
  usuarioPermisoId: number;
  permisoId: number;
  recurso: string;
  accion: string;
  permitido: boolean;
}

export interface AuthPermissionResponse {
  recurso: string;
  accion: string;
}

export interface RolePermissionResponse {
  recurso: string;
  accion: string;
}

export interface ProfileResponse {
  usuarioId: number;
  email: string;
  nombre: string | null;
  telefono: string | null;
  avatar: AvatarResponse | null;
  rol: {
    rolId: number;
    nombre: string;
  } | null;
}

export interface EffectivePermissionsResponse {
  usuarioId: number;
  permisos: AuthPermissionResponse[];
}
