import type { UserEntity } from '../entities/user.entity';

export interface UserAvatar {
  url: string;
  key?: string;
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
  [key: string]: any;
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
  avatar?: any;
  rolId: number;
}

export interface UpdateUserRepositoryData {
  email?: string;
  clave?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  avatar?: any;
  rolId?: number;
  deletedAt?: Date | null;
}

/**
 * Usuario devuelto por el flujo de login: incluye el hash de la clave y el
 * estado de protección contra fuerza bruta (issue #136).
 */
export type UserWithPasswordAndLockout = UserEntity & {
  clave: string;
  intentosFallidos: number;
  ultimoIntentoFallidoEn: Date | null;
  bloqueadoHasta: Date | null;
};

/**
 * Configuración para registrar un intento de login fallido y aplicar la
 * política de lockout por cuenta.
 */
export interface FailedLoginAttemptOptions {
  /** Ventana deslizante en ms. Si el último fallo fue fuera de esta ventana, el contador arranca desde 1. */
  windowMs: number;
  /** Umbral de fallos a partir del cual se bloquea la cuenta. */
  threshold: number;
  /** Duración del bloqueo en ms (cooldown). */
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
