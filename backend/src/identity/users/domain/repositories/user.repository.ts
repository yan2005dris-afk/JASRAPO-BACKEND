import type { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { UserEntity } from '../entities/user.entity';

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

export abstract class UserRepository {
  abstract findById(usuarioId: number): Promise<UserEntity | null>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPasswordAndLockout | null>;

  abstract findManyActive(
    pagination: PaginationDto,
  ): Promise<{ data: UserEntity[]; meta: any }>;

  abstract findMany(
    filters: UserFilters,
    pagination: PaginationDto,
  ): Promise<{ data: UserEntity[]; meta: any }>;

  abstract create(
    data: CreateUserRepositoryData,
  ): Promise<UserEntity>;

  abstract update(
    usuarioId: number,
    data: UpdateUserRepositoryData,
    tx?: any,
  ): Promise<UserEntity>;

  abstract findRoleById(rolId: number): Promise<any>;

  abstract findRoleByName(nombre: string): Promise<any>;

  abstract findDirectPermissions(usuarioId: number): Promise<any[]>;

  abstract findRolePermissions(rolId: number): Promise<any[]>;

  abstract updatePermissions(
    usuarioId: number,
    permissions: { permisoId: number; permitido?: boolean }[],
    tx?: any,
  ): Promise<void>;

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;

  /**
   * Registra un intento de login fallido aplicando la ventana deslizante y el
   * umbral de lockout. Si se alcanza el umbral, bloquea la cuenta y reinicia
   * el contador. Operación atómica.
   */
  abstract recordFailedLoginAttempt(
    usuarioId: number,
    options: FailedLoginAttemptOptions,
  ): Promise<FailedLoginAttemptResult>;

  /**
   * Limpia los contadores de intentos fallidos al confirmar un login exitoso.
   */
  abstract clearFailedLoginAttempts(usuarioId: number): Promise<void>;
}
