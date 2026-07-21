import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseReading {
  lecturaId: string;
  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number;
  contratoId: string;
  descripcionAnomalia: string | null;
  fechaValidacion: Date | null;
  fotoUrl: string | null;
  isValidada: boolean;
  lecturaInicial: boolean;
  periodoId: number;
  tieneAnomalia: boolean;
  estado: string;
  contrato?: {
    contratoId: string;
    numeroGuia: string;
    direccionSuministro: string;
    estado: string;
  } | null;
  medidor?: {
    medidorId: string;
    serie: string;
    marca: string;
    modelo: string;
  } | null;
  periodoRel?: {
    periodoId: number;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
  } | null;
}

export const safeReadingsSelect = {
  lecturaId: true,
  fecha: true,
  lecturaAnterior: true,
  lecturaActual: true,
  consumoCalculado: true,
  descripcionAnomalia: true,
  fechaValidacion: true,
  fotoUrl: true,
  lecturaInicial: true,
  periodoId: true,
  estado: true,
  deletedAt: true,
  medidor: {
    select: {
      medidorId: true,
      serie: true,
      marca: true,
      modelo: true,
      historial: {
        where: { fechaHasta: null },
        select: {
          contrato: {
            select: {
              contratoId: true,
              numeroGuia: true,
              direccionSuministro: true,
              estado: true,
            },
          },
        },
      },
    },
  },
  periodoRel: {
    select: {
      periodoId: true,
      nombre: true,
      fechaInicio: true,
      fechaFin: true,
    },
  },
} satisfies Prisma.LecturasSelect;
