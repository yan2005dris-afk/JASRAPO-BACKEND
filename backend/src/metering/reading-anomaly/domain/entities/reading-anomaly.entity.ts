import type { TipoAnomalia, EstadoAnomalia } from 'src/shared/enums';
import type { ReadingAnomalyLecturaRef } from '../types/reading-anomaly-relations';

export class ReadingAnomalyEntity {
  anomaliaId: bigint;

  lecturaId: bigint;

  observacion: string | null;

  tipo: TipoAnomalia;

  estado: EstadoAnomalia;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  fotoUrl: string | null;

  // Relaciones opcionales del dominio
  lectura?: ReadingAnomalyLecturaRef | null;

  constructor(partial: Partial<ReadingAnomalyEntity>) {
    Object.assign(this, partial);
  }
}
