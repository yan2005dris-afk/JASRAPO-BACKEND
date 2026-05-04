import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseMeters {
  medidorId: bigint;
  contratoId: bigint | null;
  marca: string;
  modelo: string;
  serie: string;
  estado: {
    estadoId: bigint;
    codigo: string;
    nombre: string;
  } | null;
  fechaInstalacion: Date | null;
  fechaBaja: Date | null;
  motivo: string | null;
  latitud: number | null;
  longitud: number | null;
}

export const safeMeterSelect = {
  medidorId: true,
  contratoId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: {
    select: {
      estadoId: true,
      codigo: true,
      nombre: true,
    },
  },
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
} satisfies Prisma.MedidoresSelect;

export const safeMeterSelectWithDelete = {
  medidorId: true,
  contratoId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: {
    select: {
      estadoId: true,
      codigo: true,
      nombre: true,
    },
  },
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
  deletedAt: true,
} satisfies Prisma.MedidoresSelect;
