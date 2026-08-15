export interface RolePermission {
  rolPermisoId: number;
  rolId: number;
  permisoId: number;
  deletedAt: Date | null;
  permiso?: {
    permisoId: number;
    nombre: string;
    descripcion: string | null;
    recurso: string;
    accion: string;
  };
}

export interface CreateRoleRepositoryData {
  nombre: string;
}

export interface UpdateRoleRepositoryData {
  nombre?: string;
  deletedAt?: Date | null;
}
