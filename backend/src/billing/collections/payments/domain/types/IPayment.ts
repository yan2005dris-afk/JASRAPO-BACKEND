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
  tarjetaCredito: string | null;
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
