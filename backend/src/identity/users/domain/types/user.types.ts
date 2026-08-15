import type { UserEntity } from '../entities/user.entity';

export interface UserAvatar {
  url: string;
  key?: string;
}

export interface UserAvatarInput {
  key: string;
}

export interface UserDirectPermission {
  usuarioPermisoId: number;
  permisoId: number;
  recurso: string;
  accion: string;
  permitido: boolean;
}

export interface UserRolePermission {
  recurso: string;
  accion: string;
}

export interface UserDirectPermissionInput {
  permisoId: number;
  permitido?: boolean;
}

export interface DomainPaginationParams {
  page?: number;
  limit?: number;
}

export interface DomainPaginationMeta {
  total: number;
  page: number;
  limit: number;
  ultimaPagina: number;
  paginaActual: number;
  porPagina: number;
  anterior: number | null;
  siguiente: number | null;
}

export interface DomainPaginatedResult<T> {
  data: T[];
  meta: DomainPaginationMeta;
}

export interface FiltroFecha {
  igualA?: Date | null;
  antesDe?: Date;
  despuesDe?: Date;
}

export interface UserFilters {
  deletedAt?: FiltroFecha | null;
  email?: string;
}

export interface CreateUserRepositoryData {
  email: string;
  clave: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  avatar?: UserAvatarInput;
  rolId: number;
}

export interface UpdateUserRepositoryData {
  email?: string;
  clave?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  avatar?: UserAvatarInput;
  rolId?: number;
  deletedAt?: Date | null;
}

export type UserWithPasswordAndLockout = UserEntity & {
  clave: string;
  intentosFallidos: number;
  ultimoIntentoFallidoEn: Date | null;
  bloqueadoHasta: Date | null;
};

export interface FailedLoginAttemptOptions {
  windowMs: number;
  threshold: number;
  lockoutDurationMs: number;
}

export interface FailedLoginAttemptResult {
  intentosFallidos: number;
  bloqueadoHasta: Date | null;
}

export interface EffectivePermissionsResponse {
  usuarioId: number;
  permisos: UserRolePermission[];
}
