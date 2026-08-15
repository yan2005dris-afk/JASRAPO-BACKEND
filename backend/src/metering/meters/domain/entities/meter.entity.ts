import type { EstadoMedidor } from 'src/shared/enums';

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

  constructor(partial?: Partial<MeterEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.serie !== undefined && this.serie !== null && this.serie.trim() === '') {
      throw new Error('El número de serie del medidor no puede estar vacío');
    }
    if (
      this.fechaInstalacion &&
      this.fechaBaja &&
      new Date(this.fechaBaja) < new Date(this.fechaInstalacion)
    ) {
      throw new Error('La fecha de baja no puede ser anterior a la fecha de instalación');
    }
  }
}
