export interface PaymentFilters {
  clienteId?: string | bigint;
  estadoPago?: string;
  banco?: string;
  tarjetaCredito?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface PaymentDetailInput {
  comprobanteId?: string | null;
  cuotaConvenioId?: string | null;
  tipoPago: string;
  montoAbonado: number;
  formaPagoId: number;
  referencia?: string | null;
  fechaTransaccion?: string | null;
}

export interface CreatePaymentParams {
  clienteId: string;
  cajaId?: string | null;
  banco?: string | null;
  tarjetaCredito?: string | null;
  fechaPago: string;
  montoTotalRecibido: number;
  numeroOperacion?: string | null;
  observaciones?: string | null;
  referenciaBanco?: string | null;
  comprobanteUrl?: string | null;
  detalle: PaymentDetailInput[];
}

export interface ApplySaldoFavorParams {
  clienteId: string;
  saldoFavorId: string;
  montoAplicar: number;
  comprobanteId?: string | null;
  cuotaConvenioId?: string | null;
  formaPagoId: number;
  observaciones?: string | null;
}

export interface DailyCashSummaryParams {
  fecha?: string;
  cajaId?: string;
}

export interface DailyCashSummaryBreakdownItem {
  codigo: string;
  total: number;
}

export interface DailyCashSummaryResult {
  fecha: string;
  cajaId: string | null;
  totalPagos: number;
  totalRecaudado: number;
  desglosePorTipoDetalle: DailyCashSummaryBreakdownItem[];
  desglosePorTipoComprobante: DailyCashSummaryBreakdownItem[];
}
