import { ComprobanteEstado } from '../constants/comprobante-estado.enum';
import { TipoComprobante, Ambiente, TipoEmision } from '../constants';

export class ComprobanteEntity {
  id: bigint;
  emisorId: number;
  puntoEmisionId: number;
  tipoComprobante: TipoComprobante | string;
  ambiente: Ambiente | string;
  tipoEmision: TipoEmision | string;
  secuencial: string;
  claveAcceso: string;
  fechaEmision: Date;
  estado: ComprobanteEstado;
  estadoSri?: string | null;
  mensajesSri?: any | null;
  numeroAutorizacion?: string | null;
  fechaAutorizacion?: Date | null;
  xmlSinFirmaKey?: string | null;
  xmlFirmadoKey?: string | null;
  xmlAutorizadoKey?: string | null;
  prefacturaId?: number | null;
  subtotal: number;
  totalDescuento: number;
  totalIva: number;
  propina: number;
  importeTotal: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ComprobanteEntity>) {
    Object.assign(this, partial);
  }

  isAuthorized(): boolean {
    return this.estado === ComprobanteEstado.AUTORIZADO;
  }

  isPending(): boolean {
    return (
      this.estado === ComprobanteEstado.BORRADOR ||
      this.estado === ComprobanteEstado.POR_EMITIR
    );
  }

  canBeEmitted(): boolean {
    return (
      this.estado === ComprobanteEstado.BORRADOR ||
      this.estado === ComprobanteEstado.POR_EMITIR
    );
  }
}
