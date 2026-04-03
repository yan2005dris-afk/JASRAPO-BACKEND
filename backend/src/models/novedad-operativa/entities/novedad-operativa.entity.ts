import { TipoNovedad, EstadoNovedad, Prisma } from 'src/generated/prisma/client';

export class NovedadOperativaEntity {
  novedadId: string;
  lecturaId: string;
  observacion: string | null;
  tipo: TipoNovedad;
  estado: EstadoNovedad;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<Prisma.NovedadOperativaGetPayload<{}>>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.novedadId) this.novedadId = partial.novedadId.toString();
      if (partial.lecturaId) this.lecturaId = partial.lecturaId.toString();
    }
  }
}