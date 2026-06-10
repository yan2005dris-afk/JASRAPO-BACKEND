import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseMeters {
  medidorId: bigint;
  marca: string;
  modelo: string;
  serie: string;
  estado: string;
  fechaInstalacion: Date | null;
  fechaBaja: Date | null;
  motivo: string | null;
  latitud: number | null;
  longitud: number | null;
}

export const safeMeterSelect = {
  medidorId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
} satisfies Prisma.MedidoresSelect;

export const safeMeterSelectWithDelete = {
  medidorId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
  deletedAt: true,
} satisfies Prisma.MedidoresSelect;
