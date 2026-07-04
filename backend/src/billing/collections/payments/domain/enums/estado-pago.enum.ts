export const EstadoPago = {
  PENDIENTE: 'PENDIENTE',
  REGISTRADO: 'REGISTRADO',
  ANULADO: 'ANULADO',
} as const;

export type EstadoPago = (typeof EstadoPago)[keyof typeof EstadoPago];
