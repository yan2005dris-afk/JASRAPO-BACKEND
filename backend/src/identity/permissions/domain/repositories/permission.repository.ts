export interface CreatePermissionRepositoryData {
  nombre: string;
  descripcion: string;
  recurso: string;
  accion: string;
}

export interface UpdatePermissionRepositoryData {
  nombre?: string;
  descripcion?: string;
  recurso?: string;
  accion?: string;
  deletedAt?: Date | null;
}

export interface PermissionEntity {
  permisoId: number;
  nombre: string;
  descripcion: string;
  recurso: string;
  accion: string;
  deletedAt: Date | null;
}

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
