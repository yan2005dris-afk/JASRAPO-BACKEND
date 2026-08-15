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

export class RoleEntity {
  rolId: number;
  nombre: string;
  deletedAt: Date | null;
  rolPermisos?: RolePermission[];

  constructor(partial?: Partial<RoleEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
