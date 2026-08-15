import { PreInvoiceDetailEntity } from './pre-invoice-detail.entity';

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

export class PreInvoiceEntity {
  prefacturaId: bigint;
  uuid: string;
  contratoId: bigint;
  loteId: bigint | null;
  periodoId: number;
  puntoEmisionId: number;
  lecturaAnterior: number | null;
  lecturaActual: number | null;
  consumoM3: number | null;
  subtotal: number;
  iva: number;
  descuentoTotal: number;
  totalPagar: number;
  deudaAnterior: number;
  saldoVencido: number;
  abono: number;
  saldoActual: number;
  mesesAtrasado: number;
  estado: string;
  aprobadaPor: string | null;
  fechaAprobacion: Date | null;
  motivoRechazo: string | null;
  clienteDireccion: string | null;
  clienteEmail: string | null;
  clienteIdentificacion: string | null;
  clienteNombre: string | null;
  tarifaNombre: string | null;
  tarifaValorBase: number | null;
  tarifaValorExcedente: number | null;
  lecturaId: bigint | null;
  comprobanteId: bigint | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  detalles?: PreInvoiceDetailEntity[];
  contrato?: PreInvoiceContractRef | null;
  lote?: PreInvoiceLoteRef | null;
  periodoRel?: PreInvoicePeriodoRef | null;
  puntoEmision?: PreInvoicePuntoEmisionRef | null;

  constructor(partial: Partial<PreInvoiceEntity>) {
    Object.assign(this, partial);
  }
}
