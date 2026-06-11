import type { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import type { UserWithRoleResponse } from '../types/user.types';

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

export abstract class UserRepository {
  abstract findById(usuarioId: number): Promise<UserWithRoleResponse | null>;

  abstract findByEmail(email: string): Promise<UserWithRoleResponse | null>;

  abstract findByEmailWithPassword(
    email: string,
  ): Promise<(UserWithRoleResponse & { clave: string }) | null>;

  abstract findManyActive(
    pagination: PaginationDto,
  ): Promise<{ data: UserWithRoleResponse[]; meta: any }>;

  abstract findMany(
    filters: UserFilters,
    pagination: PaginationDto,
  ): Promise<{ data: UserWithRoleResponse[]; meta: any }>;

  abstract create(data: CreateUserRepositoryData): Promise<UserWithRoleResponse>;

  abstract update(
    usuarioId: number,
    data: UpdateUserRepositoryData,
    tx?: any,
  ): Promise<UserWithRoleResponse>;

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
}

