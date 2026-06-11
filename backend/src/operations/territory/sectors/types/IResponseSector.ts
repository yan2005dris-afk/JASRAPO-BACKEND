import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseSector {
  sectorId: number;
  comunidadId: number | null;
  codigo: string;
  nombre: string;
  comunidades?: {
    comunidadId: number;
    codigo: string;
    nombre: string;
  } | null;
}

export const safeSectoresSelect = {
  sectorId: true,
  comunidadId: true,
  codigo: true,
  nombre: true,
  comunidades: {
    select: {
      comunidadId: true,
      codigo: true,
      nombre: true,
    },
  },
} satisfies Prisma.SectoresSelect;
