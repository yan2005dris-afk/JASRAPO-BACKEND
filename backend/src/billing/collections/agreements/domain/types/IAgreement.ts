import type { Prisma } from 'src/generated/prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces de respuesta tipada desde Prisma
// ─────────────────────────────────────────────────────────────────────────────

export interface IAgreementState {
  codigo: string;
  nombre: string;
}

export interface IInstallmentState {
  codigo: string;
  nombre: string;
}

export interface IInstallment {
  cuotaConvenioId: bigint;
  convenioId: bigint;
  numeroCuota: number;
  valorCuota: any; // Decimal de Prisma
  fechaVencimiento: Date;
  estado: string;
  fechaPago: Date | null;
  montoPagado: any;
  saldoPendiente: any;
  diasRetraso: number;
  interesMoraAplicado: any;
  pagoCompleto: boolean;
  fechaPagoAnticipado: Date | null;
}

export interface IAgreement {
  convenioId: bigint;
  contratoId: bigint;
  numeroCuotas: number;
  abonoInicial: any; // Decimal de Prisma
  deudaTotal: any;
  mesesMoraActual: number;
  estado: string;
  fechaAprobacion: Date | null;
  fechaPrimerPago: Date;
  fechaProximoPago: Date | null;
  montoPagadoActual: any;
  motivo: string | null;
  createdAt: Date;
  cuotaConvenio?: IInstallment[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Selects de Prisma (excluyen deletedAt, updatedAt para el frontend)
// ─────────────────────────────────────────────────────────────────────────────

export const safeInstallmentSelect = {
  cuotaConvenioId: true,
  convenioId: true,
  numeroCuota: true,
  valorCuota: true,
  fechaVencimiento: true,
  estado: true,
  fechaPago: true,
  montoPagado: true,
  saldoPendiente: true,
  diasRetraso: true,
  interesMoraAplicado: true,
  pagoCompleto: true,
  fechaPagoAnticipado: true,
} satisfies Prisma.CuotaConvenioSelect;

export const safeAgreementSelect = {
  convenioId: true,
  contratoId: true,
  numeroCuotas: true,
  abonoInicial: true,
  deudaTotal: true,
  mesesMoraActual: true,
  estado: true,
  fechaAprobacion: true,
  fechaPrimerPago: true,
  fechaProximoPago: true,
  montoPagadoActual: true,
  motivo: true,
  createdAt: true,
} satisfies Prisma.ConveniosSelect;

export const safeAgreementWithInstallmentsSelect = {
  ...safeAgreementSelect,
  cuotaConvenio: {
    select: safeInstallmentSelect,
    where: { deletedAt: null },
    orderBy: { numeroCuota: 'asc' as const },
  },
} satisfies Prisma.ConveniosSelect;
