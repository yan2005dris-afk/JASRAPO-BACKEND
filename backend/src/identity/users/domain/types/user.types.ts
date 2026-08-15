import type { UserEntity } from '../entities/user.entity';
import type {
  PaginationParams,
  PaginationMeta,
  PaginatedResult,
} from 'src/shared/domain/types/pagination.types';

export type DomainPaginationParams = PaginationParams;
export type DomainPaginationMeta = PaginationMeta;
export type DomainPaginatedResult<T> = PaginatedResult<T>;

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
