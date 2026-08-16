export class PuntoEmisionEntity {
  id: number;
  establecimientoId: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PuntoEmisionEntity>) {
    Object.assign(this, partial);
  }
}
