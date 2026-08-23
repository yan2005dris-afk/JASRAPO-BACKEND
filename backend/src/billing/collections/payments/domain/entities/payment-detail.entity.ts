export interface ComprobantePaymentRef {
  comprobanteId: string;
  tipoComprobante?: string;
  secuencial?: string;
  importeTotal?: number | null;
  estado?: string;
  prefactura?: {
    prefacturaId: string;
    mes?: number;
    totalPagar?: number;
    consumoM3?: number | null;
    periodoNombre?: string;
  };
}

export class PaymentDetailEntity {
  detallePagoId: bigint;
  pagoId: bigint;
  comprobanteId: bigint | null;
  cuotaConvenioId: bigint | null;
  tipoPago: string;
  montoAbonado: number;
  formaPagoId: number;
  referencia: string | null;
  fechaTransaccion: Date | null;
  createdAt: Date;
  deletedAt?: Date | null;

  comprobante?: ComprobantePaymentRef;

  constructor(partial: Partial<PaymentDetailEntity>) {
    Object.assign(this, partial);
  }
}
