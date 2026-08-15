export interface PreInvoiceFilters {
  loteId?: number;
  periodoId?: number;
  estado?: string;
  contratoId?: string;
  identificacion?: string;
}

export interface UpdatePreInvoiceStateData {
  aprobadaPor?: string;
  motivoRechazo?: string;
  fechaAprobacion?: Date;
  comprobanteId?: bigint;
}
