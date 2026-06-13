import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseReadingAnomaly {
  anomaliaId: string;
  lecturaId: string;
  observacion: string | null;
  tipo: string;
  estado: string;
  fotoUrl: string | null;
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
  fotoUrl: true,
  lectura: {
    select: {
      lecturaId: true,
      fecha: true,
      lecturaActual: true,
      consumoCalculado: true,
    },
  },
} satisfies Prisma.LecturaAnomaliaSelect;
