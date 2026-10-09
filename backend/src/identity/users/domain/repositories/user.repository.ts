import type {
  UserRow,
  FiltroFecha,
  UserFilters,
  CreateUserRepositoryData,
  UpdateUserRepositoryData,
  UserWithPasswordAndLockout,
  FailedLoginAttemptOptions,
  FailedLoginAttemptResult,
  DomainPaginationParams,
  DomainPaginatedResult,
  UserDirectPermission,
  UserRolePermission,
} from '../types/user.types';
import type { TransactionContext } from 'src/shared/domain/types/transaction';

export type {
  FiltroFecha,
  UserFilters,
  CreateUserRepositoryData,
  UpdateUserRepositoryData,
  UserWithPasswordAndLockout,
  FailedLoginAttemptOptions,
  FailedLoginAttemptResult,
  DomainPaginationParams,
  DomainPaginatedResult,
  UserDirectPermission,
  UserRolePermission,
};
export type { TransactionContext };

export abstract class UserRepository {
  abstract findById(usuarioId: number): Promise<UserRow | null>;

  abstract findByEmail(email: string): Promise<UserRow | null>;

  abstract findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPasswordAndLockout | null>;

  abstract findManyActive(
    pagination: DomainPaginationParams,
  ): Promise<DomainPaginatedResult<UserRow>>;

  abstract findMany(
    filters: UserFilters,
    pagination: DomainPaginationParams,
  ): Promise<DomainPaginatedResult<UserRow>>;

  abstract create(data: CreateUserRepositoryData): Promise<UserRow>;

  abstract update(
    usuarioId: number,
    data: UpdateUserRepositoryData,
    tx?: TransactionContext,
  ): Promise<UserRow>;

  abstract findDirectPermissions(
    usuarioId: number,
  ): Promise<UserDirectPermission[]>;

  abstract findRolePermissions(rolId: number): Promise<UserRolePermission[]>;

  abstract updatePermissions(
    usuarioId: number,
    permissions: { permisoId: number; permitido?: boolean }[],
    tx?: TransactionContext,
  ): Promise<void>;

  abstract executeTransaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
  ): Promise<T>;

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
