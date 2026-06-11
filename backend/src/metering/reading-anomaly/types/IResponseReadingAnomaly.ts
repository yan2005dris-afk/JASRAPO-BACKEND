import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseReadingAnomaly {
  anomaliaId: string;
  lecturaId: string;
  observacion: string | null;
  tipo: string;
  estado: string;
  fotoUrlMinIo: string | null;
  lectura?: {
    lecturaId: string;
    fecha: Date;
    lecturaActual: number;
    consumoCalculado: number;
  } | null;
}

export const safeReadingAnomaliesSelect = {
  anomaliaId: true,
  lecturaId: true,
  observacion: true,
  tipo: true,
  estado: true,
  fotoUrlMinIo: true,
  lectura: {
    select: {
      lecturaId: true,
      fecha: true,
      lecturaActual: true,
      consumoCalculado: true,
    },
  },
} satisfies Prisma.LecturaAnomaliaSelect;
