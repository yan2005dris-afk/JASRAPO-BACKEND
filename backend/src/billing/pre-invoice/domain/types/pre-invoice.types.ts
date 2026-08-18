export interface PreInvoiceContractRef {
  contratoId: bigint;
  numeroGuia: string;
  cliente?: {
    clienteId: bigint;
    nombres: string;
    apellidos: string;
    identificacion: string;
    direccionDomicilio?: string | null;
    email?: string | null;
  } | null;
}

export interface PreInvoiceLoteRef {
  loteId: bigint;
  estado?: string | null;
  comunidad?: {
    nombre: string;
  } | null;
}

export interface PreInvoicePeriodoRef {
  nombre: string;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
}

export interface PreInvoicePuntoEmisionRef {
  id: number;
  codigo: string;
  establecimiento?: {
    id: number;
    codigo: string;
    emisor?: {
      id: number;
      ruc: string;
      razonSocial: string;
    } | null;
  } | null;
}

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
