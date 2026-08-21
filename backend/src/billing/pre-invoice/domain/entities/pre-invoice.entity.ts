import type { PreInvoiceDetailEntity } from './pre-invoice-detail.entity';
import type {
  PreInvoiceContractRef,
  PreInvoiceLoteRef,
  PreInvoicePeriodoRef,
  PreInvoicePuntoEmisionRef,
} from '../types/pre-invoice.types';

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
  mes: number;
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
