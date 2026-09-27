import type { EstadoMedidor } from 'src/shared/enums';

export class MeterEntity {
  medidorId: bigint;

  /** Correlative institutional code assigned by the system (e.g. MED-000123). */
  codigo: string | null;

  marca: string;

  modelo: string;

  serie: string;

  estado: EstadoMedidor;

  fechaInstalacion: Date | null;

  fechaBaja: Date | null;

  motivo: string | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  contratoId?: bigint | null;

  clienteNombre?: string | null;

  direccionSuministro?: string | null;

  constructor(partial: Partial<MeterEntity>) {
    Object.assign(this, partial);
  }
}
