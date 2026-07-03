export const TipoDetallePago = {
  COMPROBANTE: 'COMPROBANTE',
  CUOTA_CONVENIO: 'CUOTA_CONVENIO',
  PAGO_LIBRE: 'PAGO_LIBRE',
  SALDO_FAVOR: 'SALDO_FAVOR',
} as const;

export type TipoDetallePago =
  (typeof TipoDetallePago)[keyof typeof TipoDetallePago];
