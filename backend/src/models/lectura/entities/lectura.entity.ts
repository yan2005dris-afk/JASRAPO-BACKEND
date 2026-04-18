import type { Prisma } from 'src/generated/prisma/client';

export class LecturaEntity {
  lecturaId: string;
  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number;
  contratoId: string;
  createdAt: Date;
  descripcionAnomalia: string | null;
  fechaValidacion: Date | null;
  fotoUrlMinIo: string | null;
  isValidada: boolean;
  lecturaInicial: boolean;
  periodo: string;
  tieneAnomalia: boolean;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<Prisma.LecturasGetPayload<{}>>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.lecturaId) this.lecturaId = partial.lecturaId.toString();
      if (partial.contratoId) this.contratoId = partial.contratoId.toString();
    }
  }
}
