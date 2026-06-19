export const EstadoPrefactura = {
  GENERADA: 'GENERADA',
  EN_REVISION: 'EN_REVISION',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  ANULADA: 'ANULADA',
  PAGADA: 'PAGADA',
} as const;

export type EstadoPrefactura = (typeof EstadoPrefactura)[keyof typeof EstadoPrefactura];
