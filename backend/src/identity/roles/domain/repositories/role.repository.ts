export interface RolePermissionDetails {
  rolPermisoId: number;
  rolId: number;
  permisoId: number;
  deletedAt: Date | null;
  permiso: {
    permisoId: number;
    nombre: string;
    descripcion: string | null;
    recurso: string;
    accion: string;
  };
}

export interface RoleWithPermissions {
  rolId: number;
  nombre: string;
  deletedAt: Date | null;
  rolPermisos: RolePermissionDetails[];
}

export interface SimpleRole {
  rolId: number;
  nombre: string;
  deletedAt?: Date | null;
}

export interface RolePermissionAssignment {
  rolPermisoId: number;
  rolId: number;
  permisoId: number;
  deletedAt: Date | null;
}

export abstract class RoleRepository {
  abstract findUnique(rolId: number): Promise<RoleWithPermissions | null>;
  abstract findByName(nombre: string): Promise<SimpleRole | null>;
  abstract findFirstAssignment(
    rolId: number,
    permisoId: number,
  ): Promise<RolePermissionAssignment | null>;
  abstract findPermission(permisoId: number): Promise<{
    permisoId: number;
    nombre: string;
    deletedAt: Date | null;
  } | null>;
  abstract findAll(skip?: number, take?: number): Promise<SimpleRole[]>;
  abstract count(params?: { where?: Record<string, any> }): Promise<number>;
  abstract create(nombre: string): Promise<SimpleRole>;
  abstract update(
    rolId: number,
    data: { nombre?: string; deletedAt?: Date | null },
  ): Promise<SimpleRole>;
  abstract assignPermission(
    rolId: number,
    permisoId: number,
  ): Promise<RolePermissionAssignment>;
  abstract updateAssignment(
    rolPermisoId: number,
    data: { deletedAt?: Date | null },
  ): Promise<RolePermissionAssignment>;
  abstract syncSequence(): Promise<void>;
}
