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
