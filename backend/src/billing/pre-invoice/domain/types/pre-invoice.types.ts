export type {
  PreInvoiceRow,
  PreInvoiceDetailRow,
} from '../../infrastructure/repositories/pre-invoice.include';

export interface PreInvoiceFilters {
  loteId?: number;
  periodoId?: number;
  estado?: string;
  contratoId?: string;
  identificacion?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface UpdatePreInvoiceStateData {
  aprobadaPor?: string;
  motivoRechazo?: string;
  fechaAprobacion?: Date;
  comprobanteId?: bigint;
}
