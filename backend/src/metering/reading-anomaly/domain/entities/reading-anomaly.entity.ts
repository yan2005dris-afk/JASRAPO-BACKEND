import type {
  TipoAnomalia,
  EstadoAnomalia,
  Prisma,
} from 'src/generated/prisma/client';

export class ReadingAnomalyEntity {
  anomaliaId: string;
  lecturaId: string;
  observacion: string | null;
  tipo: TipoAnomalia;
  estado: EstadoAnomalia;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  fotoUrlMinIo: string | null;

  constructor(partial: Partial<Prisma.LecturaAnomaliaGetPayload<{}>>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.anomaliaId) this.anomaliaId = partial.anomaliaId.toString();
      if (partial.lecturaId) this.lecturaId = partial.lecturaId.toString();
    }
  }
}
