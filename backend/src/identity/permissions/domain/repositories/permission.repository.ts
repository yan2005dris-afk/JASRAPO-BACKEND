import type { PermissionEntity } from '../entities/permission.entity';
import type {
  CreatePermissionRepositoryData,
  UpdatePermissionRepositoryData,
} from '../types/permission.types';

export type {
  PermissionEntity,
  CreatePermissionRepositoryData,
  UpdatePermissionRepositoryData,
};

export abstract class PermissionRepository {
  abstract create(
    data: CreatePermissionRepositoryData,
  ): Promise<PermissionEntity>;
  abstract findAll(skip?: number, take?: number): Promise<PermissionEntity[]>;
  abstract count(params?: { where?: Record<string, any> }): Promise<number>;
  abstract findUnique(permisoId: number): Promise<PermissionEntity | null>;
  abstract update(
    permisoId: number,
    data: UpdatePermissionRepositoryData,
  ): Promise<PermissionEntity>;
}
