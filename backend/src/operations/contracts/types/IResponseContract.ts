import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseContract {
  contratoId: bigint;
  clienteId: bigint;
  sectorId: number | null;
  categoriaTarifaId: number;
  numeroGuia: string;
  fechaInicio: Date;
  direccionSuministro: string;
  estado: string;
  creadoPor: string | null;
  comunidadId: number;
  categoriaTarifa?: {
    categoriaTarifaId: number;
    nombre: string;
    descripcion: string | null;
    valorBase: number;
  } | null;
  cliente?: {
    clienteId: bigint;
    identificacion: string;
    nombres: string;
    apellidos: string;
    razonSocial: string | null;
  } | null;
  comunidad?: {
    comunidadId: number;
    codigo: string;
    nombre: string;
  } | null;
  sector?: {
    sectorId: number;
    codigo: string;
    nombre: string;
  } | null;
  medidor?: {
    medidorId: bigint;
    serie: string;
    marca: string;
    modelo: string;
  } | null;
}

export const safeContractsSelect = {
  contratoId: true,
  clienteId: true,
  sectorId: true,
  categoriaTarifaId: true,
  numeroGuia: true,
  fechaInicio: true,
  direccionSuministro: true,
  estado: true,
  creadoPor: true,
  comunidadId: true,
  categoriaTarifa: {
    select: {
      categoriaTarifaId: true,
      nombre: true,
      descripcion: true,
      valorBase: true,
    },
  },
  cliente: {
    select: {
      clienteId: true,
      identificacion: true,
      nombres: true,
      apellidos: true,
      razonSocial: true,
    },
  },
  comunidad: {
    select: {
      comunidadId: true,
      codigo: true,
      nombre: true,
    },
  },
  sector: {
    select: {
      sectorId: true,
      codigo: true,
      nombre: true,
    },
  },
  medidor: {
    select: {
      medidorId: true,
      serie: true,
      marca: true,
      modelo: true,
    },
  },
} satisfies Prisma.ContratosSelect;
