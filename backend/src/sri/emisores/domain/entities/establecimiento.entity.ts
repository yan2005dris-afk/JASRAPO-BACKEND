export class EstablecimientoEntity {
  id: number;
  emisorId: number;
  codigo: string;
  nombreComercial?: string | null;
  direccion: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<EstablecimientoEntity>) {
    Object.assign(this, partial);
  }
}
