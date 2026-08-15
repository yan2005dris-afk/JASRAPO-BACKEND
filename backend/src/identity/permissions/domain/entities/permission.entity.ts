export class PermissionEntity {
  permisoId: number;
  nombre: string;
  descripcion: string;
  recurso: string;
  accion: string;
  deletedAt: Date | null;

  constructor(partial?: Partial<PermissionEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
