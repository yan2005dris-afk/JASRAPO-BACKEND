export const EstadoConvenio = {
  ACTIVO: 'ACTIVO',
  PENDIENTE_ABONO: 'PENDIENTE_ABONO',
  PREPARADO: 'PREPARADO',
  ANULADO: 'ANULADO',
  PAGADO: 'PAGADO',
} as const;

export type EstadoConvenio = (typeof EstadoConvenio)[keyof typeof EstadoConvenio];
