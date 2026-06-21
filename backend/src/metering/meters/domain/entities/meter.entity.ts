import { EstadoMedidor } from 'src/shared/enums';

export class MeterEntity {
  medidorId: bigint;

  marca: string;

  modelo: string;

  serie: string;

  estado: EstadoMedidor;

  fechaInstalacion: Date | null;

  fechaBaja: Date | null;

  motivo: string | null;

  latitud: number | null;

  longitud: number | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  contratoId?: bigint | null;

  clienteNombre?: string | null;

  constructor(partial: Partial<MeterEntity>) {
    Object.assign(this, partial);
  }
}
