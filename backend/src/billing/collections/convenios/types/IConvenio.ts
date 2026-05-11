import type { Prisma } from 'src/generated/prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces de respuesta tipada desde Prisma
// ─────────────────────────────────────────────────────────────────────────────

export interface IEstadoConvenio {
  estadoConvenioId: bigint;
  codigo: string;
  nombre: string;
}

export interface IEstadoCuotaConvenio {
  estadoCuotaConvenioId: bigint;
  codigo: string;
  nombre: string;
}

export interface ICuotaConvenio {
  cuotaConvenioId: bigint;
  convenioId: bigint;
  numeroCuota: number;
  valorCuota: any; // Decimal de Prisma
  fechaVencimiento: Date;
  estado: IEstadoCuotaConvenio;
  fechaPago: Date | null;
  montoPagado: any;
  saldoPendiente: any;
  diasRetraso: number;
  interesMoraAplicado: any;
  pagoCompleto: boolean;
  fechaPagoAnticipado: Date | null;
}

export interface IConvenio {
  convenioId: bigint;
  contratoId: bigint;
  numeroCuotas: number;
  abonoInicial: any; // Decimal de Prisma
  deudaTotal: any;
  mesesMoraActual: number;
  estado: IEstadoConvenio;
  fechaAprobacion: Date | null;
  fechaPrimerPago: Date;
  fechaProximoPago: Date | null;
  montoPagadoActual: any;
  motivo: string | null;
  createdAt: Date;
  cuotaConvenio?: ICuotaConvenio[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Selects de Prisma (excluyen deletedAt, updatedAt para el frontend)
// ─────────────────────────────────────────────────────────────────────────────

export const safeEstadoConvenioSelect = {
  estadoConvenioId: true,
  codigo: true,
  nombre: true,
  descripcion: true,
  orden: true,
  activo: true,
} satisfies Prisma.EstadoConvenioSelect;

export const safeEstadoCuotaConvenioSelect = {
  estadoCuotaConvenioId: true,
  codigo: true,
  nombre: true,
  descripcion: true,
  orden: true,
  activo: true,
} satisfies Prisma.EstadoCuotaConvenioSelect;

export const safeCuotaConvenioSelect = {
  cuotaConvenioId: true,
  convenioId: true,
  numeroCuota: true,
  valorCuota: true,
  fechaVencimiento: true,
  estado: {
    select: {
      estadoCuotaConvenioId: true,
      codigo: true,
      nombre: true,
    },
  },
  fechaPago: true,
  montoPagado: true,
  saldoPendiente: true,
  diasRetraso: true,
  interesMoraAplicado: true,
  pagoCompleto: true,
  fechaPagoAnticipado: true,
} satisfies Prisma.CuotaConvenioSelect;

export const safeConvenioSelect = {
  convenioId: true,
  contratoId: true,
  numeroCuotas: true,
  abonoInicial: true,
  deudaTotal: true,
  mesesMoraActual: true,
  estado: {
    select: {
      estadoConvenioId: true,
      codigo: true,
      nombre: true,
    },
  },
  fechaAprobacion: true,
  fechaPrimerPago: true,
  fechaProximoPago: true,
  montoPagadoActual: true,
  motivo: true,
  createdAt: true,
} satisfies Prisma.ConveniosSelect;

export const safeConvenioWithCuotasSelect = {
  ...safeConvenioSelect,
  cuotaConvenio: {
    select: safeCuotaConvenioSelect,
    where: { deletedAt: null },
    orderBy: { numeroCuota: 'asc' as const },
  },
} satisfies Prisma.ConveniosSelect;
