import type { PermissionRow } from '../types/permission.types';
import type {
  CreatePermissionRepositoryData,
  UpdatePermissionRepositoryData,
} from '../types/permission.types';

export abstract class PermissionRepository {
  abstract create(data: CreatePermissionRepositoryData): Promise<PermissionRow>;
  abstract findAll(skip?: number, take?: number): Promise<PermissionRow[]>;
  abstract count(params?: { where?: Record<string, any> }): Promise<number>;
  abstract findUnique(permisoId: number): Promise<PermissionRow | null>;
  abstract update(
    permisoId: number,
    data: UpdatePermissionRepositoryData,
  ): Promise<PermissionRow>;
}
