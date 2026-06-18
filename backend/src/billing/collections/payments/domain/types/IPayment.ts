import type { Prisma } from 'src/generated/prisma/client';

export interface IPaymentDetail {
  detallePagoId: bigint;
  pagoId: bigint;
  comprobanteId: bigint | null;
  cuotaConvenioId: bigint | null;
  tipoPago: string;
  montoAbonado: any;
  formaPagoId: number;
  referencia: string | null;
  fechaTransaccion: Date | null;
  createdAt: Date;
}

export interface IPayment {
  pagoId: bigint;
  clienteId: bigint;
  cajaId: bigint | null;
  banco: string | null;
  comprobanteUrl: string | null;
  fechaPago: Date;
  montoTotalRecibido: any;
  numeroOperacion: string | null;
  observaciones: string | null;
  referenciaBanco: string | null;
  estadoPago: string;
  creadoPor: string;
  anuladoPor: string | null;
  fechaAnulacion: Date | null;
  motivoAnulacion: string | null;
  createdAt: Date;
  updatedAt: Date;
  detallePago?: IPaymentDetail[];
}

export const safePaymentDetailSelect = {
  detallePagoId: true,
  pagoId: true,
  comprobanteId: true,
  cuotaConvenioId: true,
  tipoPago: true,
  montoAbonado: true,
  formaPagoId: true,
  referencia: true,
  fechaTransaccion: true,
  createdAt: true,
  comprobante: {
    select: {
      id: true,
      tipoComprobante: true,
      secuencial: true,
      importeTotal: true,
      estado: true,
    },
  },
} satisfies Prisma.DetallePagoSelect;

export const safeSaldoFavorSelect = {
  saldoFavorId: true,
  clienteId: true,
  pagoId: true,
  montoSaldo: true,
  tipoOrigen: true,
  disponibleParaAplicar: true,
  createdAt: true,
} satisfies Prisma.SaldoFavorClienteSelect;

export const safePaymentSelect = {
  pagoId: true,
  clienteId: true,
  cajaId: true,
  banco: true,
  comprobanteUrl: true,
  fechaPago: true,
  montoTotalRecibido: true,
  numeroOperacion: true,
  observaciones: true,
  referenciaBanco: true,
  estadoPago: true,
  creadoPor: true,
  anuladoPor: true,
  fechaAnulacion: true,
  motivoAnulacion: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PagosSelect;

export const safePaymentWithDetailSelect = {
  ...safePaymentSelect,
  detallePago: {
    where: { deletedAt: null },
    select: safePaymentDetailSelect,
    orderBy: { createdAt: 'asc' as const },
  },
  saldosFavor: {
    where: { deletedAt: null },
    select: safeSaldoFavorSelect,
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.PagosSelect;
